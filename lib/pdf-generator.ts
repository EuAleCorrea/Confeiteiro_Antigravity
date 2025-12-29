import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pedido, Orcamento, storage } from './storage';

// Quote PDF Generator following professional template
export function generateQuotePDF(orcamento: Orcamento) {
    const doc = new jsPDF();
    const config = storage.getConfiguracoes();
    const empresa = config?.empresa || { nome: 'Minha Confeitaria', cnpj: '', telefone: '', endereco: '' };

    // Colors
    const primaryColor: [number, number, number] = [255, 140, 0]; // Orange
    const textColor: [number, number, number] = [60, 60, 60];

    // ===== HEADER =====
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(empresa.nome.toUpperCase(), 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (empresa.cnpj) doc.text(`CNPJ: ${empresa.cnpj}`, 14, 26);

    // Proposal number and date (right side)
    doc.setFontSize(12);
    doc.text(`Proposta Nº ${orcamento.numero}`, 196, 15, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`Data: ${new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR')}`, 196, 22, { align: 'right' });
    doc.text(`Validade: ${new Date(orcamento.dataValidade).toLocaleDateString('pt-BR')}`, 196, 29, { align: 'right' });

    // ===== CLIENT INFO =====
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Para:', 14, 45);

    doc.setFont('helvetica', 'normal');
    doc.text(orcamento.cliente.nome, 28, 45);
    doc.setFontSize(10);
    doc.text(`Tel: ${orcamento.cliente.telefone}`, 14, 52);
    if (orcamento.cliente.email) doc.text(`Email: ${orcamento.cliente.email}`, 14, 58);
    if (orcamento.ocasiao) doc.text(`Ocasião: ${orcamento.ocasiao}`, 100, 52);

    // ===== ITEMS TABLE =====
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Itens da proposta comercial', 14, 70);

    const itemsData = orcamento.itens.map(item => [
        item.nome + (item.tamanho ? ` (${item.tamanho})` : ''),
        'UN',
        item.quantidade.toString(),
        `R$ ${item.precoUnitario.toFixed(2)}`,
        `R$ ${item.subtotal.toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: 74,
        head: [['Descrição do produto/serviço', 'Un', 'Qtd.', 'Preço un.', 'Preço total']],
        body: itemsData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' }
        }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 8;

    // ===== DECORATION =====
    if (orcamento.decoracao?.descricao) {
        doc.setFillColor(245, 245, 245);
        doc.rect(14, currentY, 182, 20, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('DESCRIÇÃO DA DECORAÇÃO:', 16, currentY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(orcamento.decoracao.descricao.substring(0, 150), 16, currentY + 13, { maxWidth: 175 });
        currentY += 25;
    }

    // ===== DELIVERY =====
    doc.setFont('helvetica', 'bold');
    doc.text(`TIPO: ${orcamento.entrega?.tipo?.toUpperCase() || 'RETIRADA'}`, 14, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date(orcamento.entrega?.data || '').toLocaleDateString('pt-BR')} às ${orcamento.entrega?.horario || '--:--'}`, 80, currentY);
    currentY += 6;

    if (orcamento.entrega?.tipo === 'Entrega' && orcamento.entrega?.endereco) {
        const end = orcamento.entrega.endereco;
        doc.text(`Endereço: ${end.rua}, ${end.numero} - ${end.bairro}, ${end.cidade}/${end.estado}`, 14, currentY);
        currentY += 8;
    }

    // ===== TERMS SECTIONS =====
    const addTermSection = (title: string, content: string, bgColor?: [number, number, number]) => {
        if (!content) return;

        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        if (bgColor) {
            doc.setFillColor(...bgColor);
            doc.rect(14, currentY - 4, 182, 8, 'F');
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...(bgColor ? [255, 255, 255] : textColor) as [number, number, number]);
        doc.text(title, 16, currentY);
        currentY += 5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        doc.setFontSize(8);
        const lines = doc.splitTextToSize(content, 175);
        doc.text(lines, 16, currentY);
        currentY += (lines.length * 4) + 6;
    };

    currentY += 5;
    addTermSection('INFORMAÇÕES IMPORTANTES - LEIA COM ATENÇÃO', '', primaryColor);
    addTermSection('PAGAMENTO', orcamento.termos?.pagamento || '');
    addTermSection('IMPORTANTE', orcamento.termos?.importante || '');
    addTermSection('CUIDADOS', orcamento.termos?.cuidados || '');
    addTermSection('TRANSPORTE', orcamento.termos?.transporte || '');
    addTermSection('CANCELAMENTOS', orcamento.termos?.cancelamento || '');

    // ===== SUMMARY TABLE =====
    if (currentY > 240) {
        doc.addPage();
        currentY = 20;
    }

    const totalItens = orcamento.itens.reduce((sum, i) => sum + i.subtotal, 0);
    const frete = orcamento.entrega?.taxa || 0;
    const totalQtd = orcamento.itens.reduce((sum, i) => sum + i.quantidade, 0);

    autoTable(doc, {
        startY: currentY + 5,
        head: [['Nº de Itens', 'Soma das Qtdes', 'Total dos itens', 'Frete', 'Total da proposta']],
        body: [[
            orcamento.itens.length.toString(),
            totalQtd.toString(),
            `R$ ${totalItens.toFixed(2)}`,
            `R$ ${frete.toFixed(2)}`,
            `R$ ${orcamento.valorTotal.toFixed(2)}`
        ]],
        theme: 'grid',
        headStyles: { fillColor: [245, 245, 245], textColor: textColor, fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 9, halign: 'center' }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // ===== SIGNATURE =====
    doc.setFontSize(10);
    doc.text('Atenciosamente,', 14, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(empresa.nome, 14, currentY + 6);

    // Save
    doc.save(`orcamento-${orcamento.numero}.pdf`);
}

export function generateProductionReport(startDate: string, endDate: string, orders: Pedido[]) {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Relatório de Produção', 14, 22);

    doc.setFontSize(11);
    doc.text(`Período: ${new Date(startDate).toLocaleDateString()} a ${new Date(endDate).toLocaleDateString()}`, 14, 30);
    doc.text(`Total de Pedidos: ${orders.length}`, 14, 36);

    // Aggregate Data
    const summary = {
        massas: {} as Record<string, number>,
        recheios: {} as Record<string, number>,
    };

    orders.forEach(order => {
        order.itens.forEach(item => {
            if (item.saborMassa) {
                summary.massas[item.saborMassa] = (summary.massas[item.saborMassa] || 0) + item.quantidade;
            }
            if (item.saborRecheio) {
                const fillings = item.saborRecheio.split(" + ");
                fillings.forEach(f => {
                    summary.recheios[f] = (summary.recheios[f] || 0) + item.quantidade;
                });
            }
        });
    });

    // Massas Table
    doc.setFontSize(14);
    doc.text('Resumo de Massas', 14, 48);

    autoTable(doc, {
        startY: 52,
        head: [['Sabor da Massa', 'Quantidade (Itens)']],
        body: Object.entries(summary.massas).map(([nome, qtd]) => [nome, qtd]),
        theme: 'striped',
        headStyles: { fillColor: [255, 165, 0] } // Orange
    });

    // Recheios Table
    let finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.text('Resumo de Recheios', 14, finalY);

    autoTable(doc, {
        startY: finalY + 4,
        head: [['Sabor do Recheio', 'Quantidade (Total)']],
        body: Object.entries(summary.recheios).map(([nome, qtd]) => [nome, qtd]),
        theme: 'striped',
        headStyles: { fillColor: [255, 105, 180] } // Pink
    });

    // Detailed Orders Table
    finalY = (doc as any).lastAutoTable.finalY + 15;

    // Check if new page needed
    if (finalY > 250) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(14);
    doc.text('Lista de Pedidos no Período', 14, finalY);

    autoTable(doc, {
        startY: finalY + 4,
        head: [['Nº', 'Cliente', 'Data', 'Itens', 'Total']],
        body: orders.map(o => [
            o.numero,
            o.cliente.nome,
            new Date(o.dataEntrega).toLocaleDateString(),
            o.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', '),
            `R$ ${o.financeiro.valorTotal.toFixed(2)}`
        ]),
        theme: 'grid'
    });

    doc.save(`relatorio-producao-${startDate}-a-${endDate}.pdf`);
}

export function generateOrderList(orders: Pedido[]) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Lista de Pedidos', 14, 22);

    autoTable(doc, {
        startY: 30,
        head: [['Nº', 'Cliente', 'Data Entrega', 'Status', 'Valor']],
        body: orders.map(o => [
            o.numero,
            o.cliente.nome,
            `${new Date(o.dataEntrega).toLocaleDateString()} ${o.horaEntrega}`,
            o.status,
            `R$ ${o.financeiro.valorTotal.toFixed(2)}`
        ]),
    });

    doc.save('lista-pedidos.pdf');
}

/**
 * Generates a Quote PDF and returns it as a base64 string (without data: prefix).
 * Used for WhatsApp document attachments.
 */
export function generateQuotePDFBase64(orcamento: Orcamento): string {
    const doc = new jsPDF();
    const config = storage.getConfiguracoes();
    const empresa = config?.empresa || { nome: 'Minha Confeitaria', cnpj: '', telefone: '', endereco: '' };

    // Colors
    const primaryColor: [number, number, number] = [255, 140, 0]; // Orange
    const textColor: [number, number, number] = [60, 60, 60];

    // ===== HEADER =====
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(empresa.nome.toUpperCase(), 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (empresa.cnpj) doc.text(`CNPJ: ${empresa.cnpj}`, 14, 26);

    // Proposal number and date (right side)
    doc.setFontSize(12);
    doc.text(`Proposta Nº ${orcamento.numero}`, 196, 15, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`Data: ${new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR')}`, 196, 22, { align: 'right' });
    doc.text(`Validade: ${new Date(orcamento.dataValidade).toLocaleDateString('pt-BR')}`, 196, 29, { align: 'right' });

    // ===== CLIENT INFO =====
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Para:', 14, 45);

    doc.setFont('helvetica', 'normal');
    doc.text(orcamento.cliente.nome, 28, 45);
    doc.setFontSize(10);
    doc.text(`Tel: ${orcamento.cliente.telefone}`, 14, 52);
    if (orcamento.cliente.email) doc.text(`Email: ${orcamento.cliente.email}`, 14, 58);
    if (orcamento.ocasiao) doc.text(`Ocasião: ${orcamento.ocasiao}`, 100, 52);

    // ===== ITEMS TABLE =====
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Itens da proposta comercial', 14, 70);

    const itemsData = orcamento.itens.map(item => [
        item.nome + (item.tamanho ? ` (${item.tamanho})` : ''),
        'UN',
        item.quantidade.toString(),
        `R$ ${item.precoUnitario.toFixed(2)}`,
        `R$ ${item.subtotal.toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: 74,
        head: [['Descrição do produto/serviço', 'Un', 'Qtd.', 'Preço un.', 'Preço total']],
        body: itemsData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' }
        }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 8;

    // ===== DECORATION =====
    if (orcamento.decoracao?.descricao) {
        doc.setFillColor(245, 245, 245);
        doc.rect(14, currentY, 182, 20, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('DESCRIÇÃO DA DECORAÇÃO:', 16, currentY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(orcamento.decoracao.descricao.substring(0, 150), 16, currentY + 13, { maxWidth: 175 });
        currentY += 25;
    }

    // ===== DELIVERY =====
    doc.setFont('helvetica', 'bold');
    doc.text(`TIPO: ${orcamento.entrega?.tipo?.toUpperCase() || 'RETIRADA'}`, 14, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date(orcamento.entrega?.data || '').toLocaleDateString('pt-BR')} às ${orcamento.entrega?.horario || '--:--'}`, 80, currentY);
    currentY += 6;

    if (orcamento.entrega?.tipo === 'Entrega' && orcamento.entrega?.endereco) {
        const end = orcamento.entrega.endereco;
        doc.text(`Endereço: ${end.rua}, ${end.numero} - ${end.bairro}, ${end.cidade}/${end.estado}`, 14, currentY);
        currentY += 8;
    }

    // ===== SUMMARY TABLE =====
    if (currentY > 240) {
        doc.addPage();
        currentY = 20;
    }

    const totalItens = orcamento.itens.reduce((sum, i) => sum + i.subtotal, 0);
    const frete = orcamento.entrega?.taxa || 0;
    const totalQtd = orcamento.itens.reduce((sum, i) => sum + i.quantidade, 0);

    autoTable(doc, {
        startY: currentY + 5,
        head: [['Nº de Itens', 'Soma das Qtdes', 'Total dos itens', 'Frete', 'Total da proposta']],
        body: [[
            orcamento.itens.length.toString(),
            totalQtd.toString(),
            `R$ ${totalItens.toFixed(2)}`,
            `R$ ${frete.toFixed(2)}`,
            `R$ ${orcamento.valorTotal.toFixed(2)}`
        ]],
        theme: 'grid',
        headStyles: { fillColor: [245, 245, 245], textColor: textColor, fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 9, halign: 'center' }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // ===== SIGNATURE =====
    doc.setFontSize(10);
    doc.text('Atenciosamente,', 14, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(empresa.nome, 14, currentY + 6);

    // Return base64 without prefix
    const base64Full = doc.output('datauristring');
    // Remove "data:application/pdf;filename=generated.pdf;base64," prefix
    const base64Clean = base64Full.split(',')[1];
    return base64Clean;
}

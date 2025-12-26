import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pedido } from './storage';

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

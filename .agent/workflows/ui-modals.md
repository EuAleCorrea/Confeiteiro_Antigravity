---
description: Regras de UI/UX para o projeto Confeiteiro
---

# Regras de Interface e UX

## 1. Modais vs Alertas de Navegador

**NUNCA** use `alert()`, `confirm()` ou `prompt()` nativos do navegador.

**SEMPRE** use o componente `Dialog` de `@/components/ui/Dialog` para:
- Confirmações de exclusão
- Confirmações de ação (aprovar, enviar, converter)
- Duplicação de registros
- Feedback de sucesso
- Mensagens de erro
- Avisos de validação

---

## 2. Padrão de implementação para Modais de Erro

### Imports necessários:
```tsx
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";
```

### Estado:
```tsx
const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
```

### Substituindo alert() por setErrorModal:
```tsx
// ❌ ERRADO
if (!cliente) return alert("Selecione um cliente");

// ✅ CORRETO
if (!cliente) {
    setErrorModal({ open: true, message: 'Selecione um cliente' });
    return;
}
```

### Componente do Modal de Erro:
```tsx
{/* Error Modal */}
<Dialog
    isOpen={errorModal.open}
    onClose={() => setErrorModal({ open: false, message: '' })}
    title="Atenção"
    className="max-w-sm"
>
    <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={32} className="text-error" />
        </div>
        <p className="text-text-primary font-medium">{errorModal.message}</p>
        <Button onClick={() => setErrorModal({ open: false, message: '' })} className="w-full">
            OK
        </Button>
    </div>
</Dialog>
```

---

## 3. Padrão de implementação para Modais de Sucesso

### Imports necessários:
```tsx
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";
```

### Estado:
```tsx
const [successModal, setSuccessModal] = useState(false);
```

### Substituindo alert() de sucesso:
```tsx
// ❌ ERRADO  
alert("Configurações salvas!");

// ✅ CORRETO
setSuccessModal(true);
```

### Componente do Modal de Sucesso:
```tsx
{/* Success Modal */}
<Dialog
    isOpen={successModal}
    onClose={() => setSuccessModal(false)}
    title="Sucesso"
    className="max-w-sm"
>
    <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-success" />
        </div>
        <p className="text-text-primary font-medium">Configurações salvas!</p>
        <Button onClick={() => setSuccessModal(false)} className="w-full">
            OK
        </Button>
    </div>
</Dialog>
```

---

## 4. Padrão de implementação para Confirmação de Exclusão

### Estado:
```tsx
const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
```

### Substituindo confirm():
```tsx
// ❌ ERRADO
const handleDelete = (id: string) => {
    if (confirm("Excluir item?")) {
        storage.deleteItem(id);
        loadData();
    }
};

// ✅ CORRETO
const handleDelete = (id: string) => {
    setDeleteModal({ open: true, id });
};

const confirmDelete = () => {
    if (deleteModal.id) {
        storage.deleteItem(deleteModal.id);
        loadData();
        setDeleteModal({ open: false, id: null });
    }
};
```

### Componente do Modal de Confirmação:
```tsx
{/* Delete Confirm Modal */}
<Dialog
    isOpen={deleteModal.open}
    onClose={() => setDeleteModal({ open: false, id: null })}
    title="Confirmar Exclusão"
    className="max-w-sm"
>
    <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
            <Trash2 size={32} className="text-error" />
        </div>
        <p className="text-text-primary font-medium">Deseja excluir este item?</p>
        <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, id: null })} className="flex-1">
                Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} className="flex-1">
                Excluir
            </Button>
        </div>
    </div>
</Dialog>
```

---

## 5. Ícones padrão por tipo de modal

| Tipo de Modal | Ícone | Cor do Fundo | Cor do Ícone |
|---------------|-------|--------------|--------------|
| Erro/Atenção | `AlertTriangle` | `bg-error/10` | `text-error` |
| Sucesso | `CheckCircle` | `bg-success/10` | `text-success` |
| Exclusão | `Trash2` | `bg-error/10` | `text-error` |
| Envio WhatsApp | `Send` | `bg-primary/10` | `text-primary` |
| Aprovação | `CheckCircle` | `bg-success/10` | `text-success` |
| Duplicação | `Copy` | `bg-purple-100` | `text-purple-600` |
| Informação | `Info` | `bg-blue-100` | `text-blue-600` |

---

## 6. Regras gerais de UX

1. **Sempre feche o modal após a ação**: Chame `setModal({ open: false, ... })` após executar a ação.

2. **Use className="max-w-sm"** para modais simples de confirmação/erro/sucesso.

3. **Sempre centralize o conteúdo**: Use `text-center space-y-4` no container interno.

4. **Mantenha consistência visual**: Use o mesmo padrão de ícone em círculo colorido para todos os modais.

5. **Múltiplos modais**: Se um componente já está dentro de um Dialog (como StockExitForm), use `z-[60]` para garantir que o modal de erro apareça por cima.

6. **Fragmentos React**: Se precisar de múltiplos modais no mesmo return, envolva com `<>...</>`.

---

## 7. Checklist para novos componentes

- [ ] Não usar `alert()` nativo
- [ ] Não usar `confirm()` nativo  
- [ ] Não usar `prompt()` nativo
- [ ] Importar `Dialog` de `@/components/ui/Dialog`
- [ ] Criar estados para `errorModal`, `successModal`, `deleteModal` conforme necessário
- [ ] Adicionar componentes de modal no final do JSX
- [ ] Usar ícones apropriados do lucide-react

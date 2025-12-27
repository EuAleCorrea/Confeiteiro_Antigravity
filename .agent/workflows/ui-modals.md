---
description: Regras de UI/UX para o projeto Confeiteiro
---

# Regras de Interface

## Modais vs Alertas de Navegador

**NUNCA** use `alert()`, `confirm()` ou `prompt()` nativos do navegador.

**SEMPRE** use o componente `Dialog` de `@/components/ui/Dialog` para:
- Confirmações de exclusão
- Confirmações de ação (aprovar, enviar, converter)
- Duplicação de registros
- Feedback de sucesso
- Mensagens de erro

### Padrão de implementação:

```tsx
// 1. Importar Dialog
import { Dialog } from "@/components/ui/Dialog";

// 2. Criar estado para o modal
const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

// 3. Função que executa a ação
function confirmDelete() {
    if (deleteModal.id) {
        // executar ação
        setDeleteModal({ open: false, id: null });
    }
}

// 4. Abrir modal ao clicar
<Button onClick={() => setDeleteModal({ open: true, id: item.id })}>
    Excluir
</Button>

// 5. Renderizar Dialog
<Dialog
    isOpen={deleteModal.open}
    onClose={() => setDeleteModal({ open: false, id: null })}
    title="Confirmar Exclusão"
>
    <div className="text-center space-y-4">
        <p>Tem certeza?</p>
        <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, id: null })}>
                Cancelar
            </Button>
            <Button onClick={confirmDelete}>
                Confirmar
            </Button>
        </div>
    </div>
</Dialog>
```

## Ícones sugeridos por tipo de modal:
- Exclusão: `AlertTriangle` (vermelho)
- Envio: `Send` (azul)
- Aprovação: `CheckCircle` (verde)
- Sucesso: `CheckCircle` (verde)
- Duplicação: `Copy` (roxo)

# Guia de Contribuição - Sistema de Gestão para Confeitaria

## 👋 Bem-vindo!

Obrigado por considerar contribuir com o Sistema de Gestão para Confeitaria! Este documento fornece diretrizes para desenvolvimento e manutenção do código.

---

## 🚀 Configurando o Ambiente de Desenvolvimento

### **Pré-requisitos**
- Node.js 18 ou superior
- npm ou yarn
- Git
- Visual Studio Code (recomendado)

### **Instalação**

```bash
# Clone o repositório
git clone https://github.com/EuAleCorrea/Confeiteiro_Antigravity.git

# Entre na pasta
cd Confeiteiro

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

### **Extensões VS Code Recomendadas**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

---

## 📁 Estrutura do Projeto

```
confeiteiro/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Rotas do painel
│   │   ├── clientes/
│   │   ├── orcamentos/
│   │   ├── pedidos/
│   │   ├── producao/
│   │   └── produtos/
│   ├── layout.tsx
│   └── page.tsx
├── components/             # Componentes React
│   ├── orcamentos/
│   ├── pedidos/
│   ├── producao/
│   └── ui/                 # Componentes UI base
├── lib/                    # Utilitários e serviços
│   ├── storage.ts          # Gerenciamento de dados
│   ├── pdf-generator.ts
│   └── utils.ts
├── public/                 # Arquivos estáticos
└── docs/                   # Documentação
```

---

## 💻 Padrões de Código

### **TypeScript**

✅ **Use tipagem forte:**
```typescript
// ✅ Correto
interface Props {
    name: string;
    age: number;
}

// ❌ Evite
const data: any = ...;
```

✅ **Defina interfaces para Props:**
```typescript
interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
    // ...
}
```

### **React Components**

✅ **Componentes de Função:**
```typescript
export function ProductCard({ product }: { product: Produto }) {
    return (
        <div>{product.nome}</div>
    );
}
```

✅ **Use "use client" quando necessário:**
```typescript
"use client";

import { useState } from "react";

export function Counter() {
    const [count, setCount] = useState(0);
    // ...
}
```

### **Nomenclatura**

- **Componentes:** PascalCase (`ProductCard`, `OrderList`)
- **Funções:** camelCase (`handleSubmit`, `calculateTotal`)
- **Arquivos:**
  - Páginas: `page.tsx`
  - Componentes: PascalCase (`ProductCard.tsx`)
- **Interfaces:** PascalCase (`Produto`, `Cliente`)

### **Organização de Imports**

```typescript
// 1. Imports externos
import { useState, useEffect } from "react";
import Link from "next/link";

// 2. Imports de lib
import { storage } from "@/lib/storage";
import { cn } from "@/lib/utils";

// 3. Imports de componentes
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// 4. Tipos
import type { Produto } from "@/lib/storage";
```

### **Tailwind CSS**

✅ **Mobile-first:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

✅ **Use classes utilitárias:**
```typescript
// ✅ Correto
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">

// ❌ Evite CSS inline
<button style={{ padding: "8px 16px", background: "#007bff" }}>
```

---

## 🔧 Adicionando Nova Funcionalidade

### **Passo a Passo**

1. **Crie uma branch:**
```bash
git checkout -b feature/nome-da-feature
```

2. **Desenvolva a funcionalidade**

3. **Teste localmente:**
```bash
npm run dev
```

4. **Commit com mensagem descritiva:**
```bash
git commit -m "feat: adiciona funcionalidade X"
```

5. **Push e crie Pull Request:**
```bash
git push origin feature/nome-da-feature
```

### **Padrão de Commits**

Use commits semânticos:
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Atualização de documentação
- `style:` Formatação, ponto e vírgula, etc
- `refactor:` Refatoração de código
- `test:` Adição de testes
- `chore:` Tarefas de manutenção

**Exemplos:**
```
feat: adiciona preço por tamanho em produtos
fix: corrige cálculo de frete em orçamentos
docs: atualiza README com instruções de instalação
```

---

## 🐛 Reportando Bugs

Ao encontrar um bug, crie uma issue no GitHub com:
1. **Título claro**
2. **Descrição do problema**
3. **Passos para reproduzir**
4. **Comportamento esperado vs atual**
5. **Screenshots (se aplicável)**

---

## 🎨 Adicionando Componentes UI

Novos componentes UI devem ser adicionados em `components/ui/`:

```typescript
// components/ui/NewComponent.tsx
"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NewComponentProps {
    children: ReactNode;
    className?: string;
}

export function NewComponent({ children, className }: NewComponentProps) {
    return (
        <div className={cn("base-classes", className)}>
            {children}
        </div>
    );
}
```

---

## 💾 Modificando Modelos de Dados

**⚠️ ATENÇÃO:** Mudanças nos modelos afetam dados armazenados!

1. Atualize a interface em `lib/storage.ts`
2. Implemente migração se necessário
3. Atualize documentação em `docs/tecnica/MODELOS_DADOS.md`
4. Teste com dados existentes

---

## 📝 Atualizando Documentação

Sempre que adicionar/modificar funcionalidades, atualize:
- **README.md** (se mudança significativa)
- **docs/tecnica/** (documentação técnica)
- **docs/negocio/** (funcionalidades de negócio)
- **docs/guias/** (manuais do usuário)

---

## ✅ Checklist Antes do Pull Request

- [ ] Código segue os padrões estabelecidos
- [ ] TypeScript sem erros (`npm run build`)
- [ ] Funcionalidade testada manualmente
- [ ] Documentação atualizada (se necessário)
- [ ] Commits semânticos
- [ ] Código revisado

---

## 🎓 Recursos Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Hooks](https://react.dev/reference/react)

---

## 📧 Dúvidas?

Abra uma issue no GitHub ou entre em contato com o mantenedor do projeto.

Obrigado por contribuir! 🎉

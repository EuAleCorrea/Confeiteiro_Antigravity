-- CRIAÇÃO DA TABELA DE PERFIL
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  email text,
  cpf text,
  phone text,
  stripe_customer_id text,
  avatar_url text
);

-- HABILITAR RLS (SEGURANÇA)
alter table public.profiles enable row level security;

-- POLÍTICAS DE ACESSO
create policy "Perfis são visíveis para o dono." on public.profiles
  for select using (auth.uid() = id);

create policy "Usuários podem atualizar o próprio perfil." on public.profiles
  for update using (auth.uid() = id);

create policy "Inserção via trigger apenas" on public.profiles
  for insert with check (auth.uid() = id);

-- FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, stripe_customer_id)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'stripe_customer_id' -- Pega do metadata se vier do Stripe
  );
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER QUE DISPARA NO CADASTRO
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- GARANTIR PERFIS PARA USUÁRIOS JÁ EXISTENTES (MIGRAÇÃO)
insert into public.profiles (id, email)
select id, email from auth.users
where id not in (select id from public.profiles)
on conflict do nothing;

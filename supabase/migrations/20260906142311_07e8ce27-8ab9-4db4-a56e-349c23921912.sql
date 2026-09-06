alter table public.subscriptions alter column user_id drop not null;

alter table public.subscriptions add column if not exists customer_email text;

create or replace function public.claim_guest_membership()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed int;
begin
  update public.subscriptions
  set user_id = auth.uid(), updated_at = now()
  where user_id is null
    and lower(customer_email) = lower(
      (select email from auth.users where id = auth.uid())
    );
  get diagnostics claimed = row_count;
  return claimed;
end;
$$;

revoke all on function public.claim_guest_membership() from public, anon;
grant execute on function public.claim_guest_membership() to authenticated;
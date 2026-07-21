GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_master_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_attempted_quiz(uuid, uuid) TO authenticated;
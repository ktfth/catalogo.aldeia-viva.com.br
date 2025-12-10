/**
 * Traduz mensagens de erro do Supabase Auth para português
 */
export function translateAuthError(errorMessage: string): string {
  const translations: Record<string, string> = {
    // Erros de credenciais
    'Invalid login credentials': 'Credenciais de login inválidas',
    'Email not confirmed': 'Email não confirmado',
    'Invalid email or password': 'Email ou senha inválidos',

    // Erros de senha
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Password is too weak': 'A senha é muito fraca',

    // Erros de email
    'Unable to validate email address: invalid format': 'Formato de email inválido',
    'User already registered': 'Usuário já cadastrado',
    'Email address is invalid': 'Endereço de email inválido',
    'A user with this email address has already been registered': 'Um usuário com este email já foi cadastrado',

    // Erros de rate limit
    'Email rate limit exceeded': 'Limite de envio de emails excedido. Tente novamente mais tarde',
    'Too many requests': 'Muitas tentativas. Tente novamente mais tarde',
    'For security purposes, you can only request this once every 60 seconds': 'Por motivos de segurança, você só pode fazer essa solicitação uma vez a cada 60 segundos',

    // Erros de token/sessão
    'Invalid token': 'Token inválido',
    'Token has expired': 'Token expirado',
    'Invalid refresh token': 'Token de atualização inválido',
    'Refresh token not found': 'Token de atualização não encontrado',

    // Erros de captcha
    'Captcha verification failed': 'Falha na verificação do captcha',
    'Captcha verification process failed': 'Falha no processo de verificação do captcha',
    'captcha protection: request disallowed': 'Proteção captcha: solicitação não permitida',

    // Erros de rede
    'Failed to fetch': 'Falha na conexão. Verifique sua internet',
    'Network request failed': 'Falha na requisição de rede',

    // Outros
    'User not found': 'Usuário não encontrado',
    'Signup requires a valid password': 'O cadastro requer uma senha válida',
    'Unable to process request': 'Não foi possível processar a solicitação',
  }

  // Procura por tradução exata
  if (translations[errorMessage]) {
    return translations[errorMessage]
  }

  // Procura por tradução parcial (caso a mensagem contenha a chave)
  for (const [key, value] of Object.entries(translations)) {
    if (errorMessage.includes(key)) {
      return value
    }
  }

  // Se não encontrar tradução, retorna a mensagem original
  return errorMessage
}

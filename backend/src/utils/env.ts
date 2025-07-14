/**
 * Obtém e valida o valor de uma variável de ambiente.
 *
 * @param name Nome da variável de ambiente desejada.
 * @returns Valor da variável se definido.
 * @throws Erro caso a variável não esteja presente no ambiente.
 */
export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}
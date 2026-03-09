import type { ChamadaItem } from "./chamada";

const PREFIXO_CHAVE = "chamada_van_";
const CHAVE_MEMORIA_FACULDADE = "memoria_faculdades";

export const salvarChamada = (data: string, itens: ChamadaItem[]): void => {
  const chave = PREFIXO_CHAVE + data;
  const itensTexto = JSON.stringify(itens);
  localStorage.setItem(chave, itensTexto);
};

export const carregarChamada = (data: string): ChamadaItem[] => {
  const chave = PREFIXO_CHAVE + data;
  const listaChamada = localStorage.getItem(chave);
  if (!listaChamada) {
    return [];
  }
  return JSON.parse(listaChamada);
};

export const salvarMemoriaFaculdade = (
  nome: string,
  faculdade: string,
): void => {
  const textoSalvo = localStorage.getItem(CHAVE_MEMORIA_FACULDADE);
  const dicionario = textoSalvo ? JSON.parse(textoSalvo) : {};
  dicionario[nome] = faculdade;
  localStorage.setItem(CHAVE_MEMORIA_FACULDADE, JSON.stringify(dicionario));
};

export const buscarMemoriaFaculdade = (nome: string): string | null => {
  const textoSalvo = localStorage.getItem(CHAVE_MEMORIA_FACULDADE);
  if (!textoSalvo) {
    return null;
  }
  const dicionario = JSON.parse(textoSalvo);
  return dicionario[nome] || null;
};

export type ChamadaItem = {
  id: number | string;
  nome: string;
  faculdade?: string;
  origem: "rota" | "retorno" | "manual";
  embarcado: boolean;
};

export type ChamadaList = {
  data: string;
  itens: ChamadaItem[];
};

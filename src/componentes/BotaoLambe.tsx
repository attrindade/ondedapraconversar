// Botão que leva o número de quem não votou para um lambe de 21x9 cm.
// A pessoa escolhe: PDF (gráfica, impressora) ou PNG (WhatsApp, redes).
//
// Autor: Matheus C. Pestana

import { useRef, useState } from "react";
import { baixarLambePdf, baixarLambePng } from "../lambe";

export default function BotaoLambe({ abstencao }: { abstencao: number }) {
  const [aberto, setAberto] = useState(false);
  const [gerando, setGerando] = useState(false);
  const vez = useRef(0);
  if (abstencao <= 0) return null;

  async function baixar(formato: "pdf" | "png") {
    setGerando(true);
    try {
      const variante = vez.current++;
      await (formato === "pdf" ? baixarLambePdf(abstencao, variante) : baixarLambePng(abstencao, variante));
      setAberto(false);
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="lambe">
      <button type="button" className="botao lambe-botao" aria-expanded={aberto} onClick={() => setAberto(!aberto)}>
        Baixar lambe para colar no bairro
      </button>
      {aberto && (
        <div className="lambe-opcoes">
          <button type="button" className="botao principal" disabled={gerando} onClick={() => baixar("pdf")}>
            PDF para imprimir
          </button>
          <button type="button" className="botao" disabled={gerando} onClick={() => baixar("png")}>
            PNG para compartilhar
          </button>
          <p className="miudo">21 x 9 cm, com o número de pessoas que não votaram aqui no 1º turno.</p>
        </div>
      )}
    </div>
  );
}

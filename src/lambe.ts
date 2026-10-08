// Lambe-lambe de 21x9 cm com o número de gente que não votou, para imprimir e
// colar no bairro. Desenhado em canvas (300 dpi); o PDF só embrulha a imagem.
//
// Autor: Matheus C. Pestana

import { fmt } from "./dados";

const LARGURA = 2480; // 21 cm a 300 dpi
const ALTURA = 1063; // 9 cm a 300 dpi
const VERMELHO = "#e00000";
const TITULO = '"Special Gothic Condensed One"';
const TEXTO = "Manrope";

/** Total nacional de quem não votou no 1º turno, como nos modelos da campanha. */
const NACIONAL = "33 milhões";

const SUBTITULOS = [
  `No Brasil, ${NACIONAL} não votaram. Com você a gente vira.`,
  `No Brasil, ${NACIONAL} não votaram. Você fez falta. Se você for a gente vira.`,
  `No Brasil, ${NACIONAL} não votaram. Se você votar, a gente vira.`,
];

let carregadas: Promise<unknown> | null = null;
function carregarFontes() {
  carregadas ??= import("./fontes/lambe.css").then(() =>
    Promise.all([document.fonts.load(`100px ${TITULO}`), document.fonts.load(`700 40px ${TEXTO}`)]),
  );
  return carregadas;
}

export async function desenharLambe(abstencao: number, variante = 0): Promise<HTMLCanvasElement> {
  await carregarFontes();
  const canvas = document.createElement("canvas");
  canvas.width = LARGURA;
  canvas.height = ALTURA;
  const c = canvas.getContext("2d")!;

  c.fillStyle = VERMELHO;
  c.fillRect(0, 0, LARGURA, ALTURA);
  c.fillStyle = "#fff";
  c.textBaseline = "alphabetic";

  const um = abstencao === 1;
  const linha1 = `${fmt(abstencao)} ${um ? "pessoa" : "pessoas"} deste bairro`;
  const antes = "não";
  const depois = ` ${um ? "votou" : "votaram"} no primeiro turno.`;

  // Maior corpo em que as duas linhas cabem em 84% da largura.
  let corpo = 330;
  const largurasA = () => {
    c.font = `${corpo}px ${TITULO}`;
    return [c.measureText(linha1).width, c.measureText(antes + depois).width];
  };
  while (corpo > 60 && Math.max(...largurasA()) > LARGURA * 0.84) corpo -= 4;
  c.font = `${corpo}px ${TITULO}`;

  const y1 = ALTURA * 0.4;
  const y2 = y1 + corpo * 1.0;
  c.textAlign = "center";
  c.fillText(linha1, LARGURA / 2, y1);

  const larguraNao = c.measureText(antes).width;
  const larguraTudo = c.measureText(antes + depois).width;
  const x = (LARGURA - larguraTudo) / 2;
  c.textAlign = "left";
  c.fillText(antes + depois, x, y2);
  c.fillRect(x, y2 + corpo * 0.07, larguraNao, Math.max(8, corpo * 0.035));

  c.textAlign = "center";
  c.font = `700 62px ${TEXTO}`;
  c.fillText(SUBTITULOS[variante % SUBTITULOS.length], LARGURA / 2, ALTURA * 0.87);

  c.textAlign = "right";
  c.font = `700 30px ${TEXTO}`;
  c.fillText("Fonte: TSE", LARGURA - 60, ALTURA - 44);
  return canvas;
}

function salvar(url: string, nome: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const nomeArquivo = (abstencao: number, ext: string) => `lambe-${abstencao}-pessoas.${ext}`;

export async function baixarLambePng(abstencao: number, variante = 0) {
  const canvas = await desenharLambe(abstencao, variante);
  salvar(canvas.toDataURL("image/png"), nomeArquivo(abstencao, "png"));
}

export async function baixarLambePdf(abstencao: number, variante = 0) {
  const [canvas, { jsPDF }] = await Promise.all([desenharLambe(abstencao, variante), import("jspdf")]);
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [210, 90] });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 90);
  pdf.save(nomeArquivo(abstencao, "pdf"));
}

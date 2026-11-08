// ============================================================================
// src/components/fiados/FiadoFormModal.jsx
// Formulário para registrar (fiado = null) ou editar um fiado.
//
// - Telefone com máscara: a pessoa digita só os números e o campo formata
//   (11) 98765-4321; o que vai para a API são apenas os dígitos.
// - A data começa em "hoje" (no relógio do aparelho).
// - A situação (Pendente/Pago) usa as mesmas bolinhas da lista.
// ============================================================================

import { useState } from 'react';
import Modal from '../ui/Modal';
import Campo from '../ui/Campo';
import EstadoErro from '../feedback/EstadoErro';
import { atualizarFiado, criarFiado } from '../../services/fiadosService';
import { extrairMensagemErro } from '../../utils/erros';
import { hojeISO } from '../../utils/formatters';
import { formatarTelefone, normalizarTelefone } from '../../utils/telefone';

const FORM_ID = 'form-fiado';

const SITUACOES = [
  { valor: false, rotulo: 'Pendente', descricao: 'Ainda não pagou', cor: 'bg-clay', ativo: 'border-clay bg-clay-light' },
  { valor: true, rotulo: 'Pago', descricao: 'Já recebi', cor: 'bg-moss', ativo: 'border-moss bg-moss-light' },
];

function valoresIniciais(fiado) {
  return {
    nome: fiado?.nome_cliente ?? '',
    telefone: fiado ? formatarTelefone(fiado.telefone) : '',
    produto: fiado?.produto ?? '',
    valor: fiado ? String(fiado.valor) : '',
    data: fiado?.data_pedido ?? hojeISO(),
    pago: fiado?.pago ?? false,
  };
}

function validar(form) {
  const erros = {};
  const valor = Number(form.valor);

  if (form.nome.trim().length < 2) erros.nome = 'Informe o nome do cliente.';
  if (normalizarTelefone(form.telefone).length < 10) {
    erros.telefone = 'Informe o DDD e o número, ex.: (11) 98765-4321.';
  }
  if (form.produto.trim().length < 2) erros.produto = 'Descreva o que foi vendido.';
  if (form.valor === '' || Number.isNaN(valor) || valor <= 0) erros.valor = 'Informe um valor maior que zero.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.data)) erros.data = 'Informe a data do pedido.';

  return erros;
}

export default function FiadoFormModal({ fiado = null, onFechar, onSalvo }) {
  const editando = Boolean(fiado);

  const [form, setForm] = useState(() => valoresIniciais(fiado));
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function alterar(campo) {
    return (evento) => setForm((atual) => ({ ...atual, [campo]: evento.target.value }));
  }

  async function aoEnviar(evento) {
    evento.preventDefault();

    const novosErros = validar(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    setErroApi(null);

    const payload = {
      nome_cliente: form.nome.trim(),
      telefone: normalizarTelefone(form.telefone),
      produto: form.produto.trim(),
      valor: Number(form.valor),
      data_pedido: form.data,
      pago: form.pago,
    };

    try {
      const salvo = editando ? await atualizarFiado(fiado.id, payload) : await criarFiado(payload);
      onSalvo(salvo, editando ? 'editado' : 'criado');
    } catch (err) {
      setErroApi(extrairMensagemErro(err, 'Não foi possível salvar o fiado. Tente novamente.'));
      setSalvando(false);
    }
  }

  return (
    <Modal
      titulo={editando ? 'Editar fiado' : 'Novo fiado'}
      onFechar={onFechar}
      podeFechar={!salvando}
      rodape={
        <div className="space-y-3">
          {erroApi && <EstadoErro mensagem={erroApi} />}
          <div className="acoes-modal">
            <button type="button" className="btn btn-secondary" onClick={onFechar} disabled={salvando}>
              Cancelar
            </button>
            <button type="submit" form={FORM_ID} className="btn btn-primary" disabled={salvando}>
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Registrar fiado'}
            </button>
          </div>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={aoEnviar} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="fiado-nome" label="Nome do cliente" erro={erros.nome}>
          <input
            type="text"
            className="input"
            value={form.nome}
            onChange={alterar('nome')}
            placeholder="Ex.: Maria das Graças"
            maxLength={150}
            autoComplete="off"
          />
        </Campo>

        <Campo id="fiado-telefone" label="Telefone para ligação" erro={erros.telefone}>
          <input
            type="tel"
            inputMode="tel"
            className="input"
            value={form.telefone}
            onChange={(e) => setForm((atual) => ({ ...atual, telefone: formatarTelefone(e.target.value) }))}
            placeholder="(11) 98765-4321"
            autoComplete="off"
          />
        </Campo>

        <Campo id="fiado-produto" label="Produto vendido" erro={erros.produto} className="sm:col-span-2">
          <textarea
            rows={2}
            maxLength={300}
            className="input resize-none"
            value={form.produto}
            onChange={alterar('produto')}
            placeholder="Ex.: 2 colares Lua de Prata + 1 vela de lavanda"
          />
        </Campo>

        <Campo id="fiado-valor" label="Valor do pedido (R$)" erro={erros.valor}>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            className="input"
            value={form.valor}
            onChange={alterar('valor')}
            placeholder="0,00"
          />
        </Campo>

        <Campo id="fiado-data" label="Data do pedido" erro={erros.data}>
          <input type="date" className="input" value={form.data} onChange={alterar('data')} />
        </Campo>

        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-sm font-medium text-ink">Situação</legend>
          <div className="grid grid-cols-2 gap-3">
            {SITUACOES.map(({ valor, rotulo, descricao, cor, ativo }) => {
              const selecionado = form.pago === valor;
              return (
                <label
                  key={rotulo}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-moss ${
                    selecionado ? ativo : 'border-line bg-white hover:bg-paper'
                  }`}
                >
                  <input
                    type="radio"
                    name="situacao-fiado"
                    checked={selecionado}
                    onChange={() => setForm((atual) => ({ ...atual, pago: valor }))}
                    className="sr-only"
                  />
                  <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cor}`} />
                  <span>
                    <span className="block text-sm font-medium text-ink">{rotulo}</span>
                    <span className="block text-xs text-ink-soft">{descricao}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

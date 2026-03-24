Documento de Requisitos Técnicos<br/>Módulo Core de Faturação

Base para desenvolvimento inicial de um futuro ERP

| Objetivo | Definir os requisitos funcionais, regras de negócio e modelo de dados do módulo core de faturação. |
| --- | --- |
| Âmbito | Aplicação desenhada de raiz, com uma base de dados por entidade/empresa. |
| Base de análise | Manual eFatura CV como referência fiscal mínima. |
| Destinatário | Equipa de desenvolvimento responsável pela implementação do backend, modelo relacional e APIs internas. |

Versão 1.0

# 1. Enquadramento e objetivo

Este documento define os requisitos técnicos e o modelo de dados do módulo core de faturação, a ser desenvolvido como um microserviço no ecossistema IGRP 3.0.

O objetivo deste módulo é disponibilizar um núcleo transacional de faturação, independente de integrações externas, capaz de suportar sistemas ERP e aplicações de terceiros.

Este módulo representa a primeira fase da solução de faturação. A segunda fase será dedicada à integração com o sistema eFatura de Cabo Verde, que será implementada como um módulo separado.

# 2. Âmbito

O módulo core de faturação cobre exclusivamente o domínio de negócio da faturação, incluindo:

- Cadastros base (entidade, clientes, fornecedores, produtos)
- Parametrizações (tipos de documento, séries, impostos, moedas, etc.)
- Emissão e gestão de documentos comerciais (faturas de venda e compra)
- Linhas de documento com cálculo de preços, descontos e impostos
- Registo e aplicação de pagamentos
- Preparação para integração contabilística através de contas GL
Ficam explicitamente fora deste âmbito:

- Integração com eFatura
- Geração de XML fiscal
- Certificados digitais
- Comunicação com serviços externos
# 3. Contexto arquitetural

módulo deve ser desenvolvido como um microserviço autónomo, com as seguintes características:

- Base de dados isolada por entidade/empresa
- APIs expostas para consumo por sistemas ERP e aplicações externas
- Independência total do módulo fiscal eletrónico
- Preparação para integração futura com:
- Módulo contabilístico
- Módulo de integração eFatura (fase 2)
Este serviço deverá funcionar como o núcleo de faturação do ecossistema, sendo reutilizável em múltiplos contextos..

# 4. Princípios de modelação de dados

O modelo deve privilegiar tabelas próprias para cada parametrização relevante, evitando uma tabela genérica única para domínios distintos. Assim, tipo de documento, série, unidade, imposto, método de pagamento e enquadramento devem existir em tabelas separadas, com regras e chaves próprias.

Os dados transacionais devem guardar uma fotografia do estado do documento no momento da emissão. Isto significa que a linha da fatura deve guardar descrição, código do artigo, unidade, preço, descontos e imposto aplicado, sem depender apenas do cadastro atual do produto.

Os valores monetários devem ser gravados no documento e nas linhas, mesmo que possam ser recalculados, de modo a preservar histórico, auditoria funcional e previsibilidade contabilística.

# 5. Requisitos funcionais principais

| ID | Área | Requisito |
| --- | --- | --- |
| RF-01 | Entidade | O sistema deve suportar uma entidade emissora por base de dados, com os respetivos dados institucionais, fiscais, moeda base e parametrizações principais. |
| RF-02 | Cliente | O sistema deve permitir registar clientes com dados de identificação, contacto, enquadramento e parametrização de aplicação de impostos. |
| RF-03 | Fornecedor | O sistema deve permitir registar fornecedores com estrutura semelhante à do cliente, adequada ao fluxo de compras. |
| RF-04 | Produto | O sistema deve permitir registar produtos e serviços, unidade, categoria, preço base, imposto padrão e contas GL associadas. |
| RF-05 | Séries | O sistema deve controlar a numeração documental por série e tipo de documento. |
| RF-06 | Fatura de venda | O sistema deve permitir criar faturas de venda com cabeçalho, linhas, descontos, impostos, vencimento e saldo. |
| RF-07 | Fatura de compra | O sistema deve permitir registar faturas de compra com estrutura equivalente à de venda. |
| RF-08 | Impostos | O sistema deve suportar impostos percentuais e impostos de valor fixo. |
| RF-09 | Pagamentos | O sistema deve permitir registar pagamentos e aplicá-los total ou parcialmente a um ou mais documentos. |
| RF-10 | Preparação contabilística | O sistema deve guardar referência a contas GL nos cadastros e nas linhas, de modo a suportar futura integração contabilística. |

# 6. Regras de negócio obrigatórias

- Cada base de dados pertence a uma única entidade; não deverá existir partilha de dados transacionais entre empresas na mesma BD.
- A numeração documental deverá ser controlada por série e tipo de documento.
- A fatura deverá possuir linhas próprias, e cada linha deverá guardar os seus próprios valores base, descontos, imposto e total.
- Os impostos devem ser aplicados ao nível da linha do documento, não apenas ao nível do total global.
- O sistema deve permitir impostos baseados em percentagem e impostos baseados em montante fixo.
- O documento deve manter histórico funcional dos valores emitidos, mesmo que o cadastro do produto ou do imposto mude depois.
- Pagamento e documento não devem estar rigidamente acoplados em relação um-para-um; o modelo deve permitir várias aplicações de pagamento.
- Campos técnicos de integração fiscal externa não devem fazer parte do core de negócio nesta fase.
- O modelo deve ficar preparado para associar uma conta GL de receita, gasto, imposto ou conta corrente sem obrigar já à geração de lançamentos contabilísticos.
# 7. Modelo de dados proposto

A estrutura abaixo representa o modelo relacional recomendado para o módulo core de faturação. Foram preservadas as principais nomenclaturas da solução legada, com alterações apenas quando necessário para corrigir limitações do desenho anterior.

## 7.1. Tabelas de cadastro mestre

| Tabela | Finalidade | Observação |
| --- | --- | --- |
| entidade | Registo institucional da empresa da base de dados | Uma linha ativa por base de dados |
| cliente | Cadastro de clientes | Acrescentar CONTA_GL_ID e remover Entidade_ID |
| fornecedor | Cadastro de fornecedores | Acrescentar CONTA_GL_ID e remover Entidade_ID |
| produto | Cadastro de produtos e serviços | Preparado para imposto padrão e contas GL de venda/compra |

## 7.2. Tabelas de parametrização

| Tabela | Descrição |
| --- | --- |
| pr_fatura_tipo | Tipos de documento comercial |
| pr_serie | Séries documentais e controlo de numeração |
| pr_unidade | Unidades de medida |
| pr_categoria | Categorias de produto/serviço |
| pr_moeda | Moedas |
| pr_enquadramento | Enquadramento fiscal/comercial do cliente, fornecedor e entidade |
| pr_metodo_pagamento | Métodos de pagamento |
| pr_imposto | Impostos parametrizados; substitui a lógica limitada de pr_iva |

## 7.3. Tabelas transacionais

| Tabela | Descrição |
| --- | --- |
| fatura_venda | Cabeçalho da fatura de venda |
| fatura_venda_item | Linhas da fatura de venda |
| fatura_venda_item_imposto | Impostos aplicados às linhas da fatura de venda |
| fatura_compra | Cabeçalho da fatura de compra |
| fatura_compra_item | Linhas da fatura de compra |
| fatura_compra_item_imposto | Impostos aplicados às linhas da fatura de compra |
| pagamento | Registo do pagamento em si |
| pagamento_documento | Aplicação do pagamento a documentos |

## 7.4. Tabela preparatória para contabilidade

| Tabela | Descrição |
| --- | --- |
| gl_conta | Plano de contas base para futura integração com contabilidade geral. |

# 8. Especificação funcional das tabelas principais

## 8.1. entidade

A tabela entidade deve representar a empresa dona da base de dados. Deixa de ser um eixo de multiempresa e passa a ser o registo institucional local.

| Campo | Obrig. | Descrição |
| --- | --- | --- |
| ID | Sim | Identificador único |
| CODIGO | Sim | Código interno da entidade |
| DESIG | Sim | Designação da empresa |
| DESCR | Não | Descrição complementar |
| NIF | Sim | Número fiscal |
| email | Não | Email principal |
| telefone | Não | Telefone principal |
| ENDERECO | Não | Endereço principal |
| GEOGRAFIA_ID | Não | Referência geográfica |
| pr_enquadramento_ID | Sim | Enquadramento da entidade |
| pr_pais_ID | Não | País |
| pr_moeda_ID | Não | Moeda base |
| DT_REGISTO | Sim | Data de registo |
| DT_ALTERACAO | Sim | Data de alteração |
| ESTADO | Sim | Estado do registo |

## 8.2. cliente

A tabela cliente deverá manter a linha de nomenclatura existente, removendo apenas o modelo multiempresa e acrescentando a referência contabilística.

| Campo | Obrig. | Descrição |
| --- | --- | --- |
| ID | Sim | Identificador único |
| CODIGO | Sim | Código interno do cliente |
| IND_COLETIVO | Sim | Indica cliente coletivo/empresa ou particular |
| DESIG | Sim | Nome/designação do cliente |
| DESCR | Não | Descrição complementar |
| NIF | Não | Número fiscal |
| NUM_CLIENTE | Não | Número comercial interno |
| EMAIL | Não | Email |
| TELEFONE | Não | Telefone |
| GEOGRAFIA_ID | Não | Referência geográfica |
| PAIS | Não | Código do país |
| ENDERECO | Não | Morada |
| PESSOA_CONTACTO | Não | Pessoa de contacto |
| APLICAR_IMPOSTOS | Sim | SIM/NAO |
| MOTIVO_NAO_APLICAR_IMPOSTO | Não | Motivo de isenção ou não aplicação |
| pr_enquadramento_ID | Não | Enquadramento fiscal/comercial |
| CONTA_GL_ID | Não | Conta GL de conta corrente cliente |
| DT_REGISTO | Sim | Data de registo |
| DT_ALTERACAO | Sim | Data de alteração |
| ESTADO | Sim | Estado do registo |

## 8.3. fornecedor

A tabela fornecedor segue a mesma lógica do cliente, adaptada ao ciclo de compras. Deve incluir CONTA_GL_ID e deixar de usar Entidade_ID.

## 8.4. produto

| Campo | Obrig. | Descrição |
| --- | --- | --- |
| ID | Sim | Identificador único |
| CODIGO | Sim | Código interno do artigo/serviço |
| DESIG | Sim | Designação comercial |
| DESCR | Não | Descrição detalhada |
| pr_categoria_ID | Não | Categoria do artigo |
| pr_unidade_ID | Não | Unidade de medida padrão |
| PRECO | Não | Preço base sugerido |
| IMPOSTO_VENDA_ID | Não | Imposto padrão de venda |
| IMPOSTO_COMPRA_ID | Não | Imposto padrão de compra |
| DESCONTO_COMERCIAL | Não | Desconto padrão |
| CONTROLAR_STOCK | Não | Indicador de controlo de stock |
| CONTA_GL_ID | Não | Conta GL principal de venda/receita |
| CONTA_GL_COMPRA_ID | Não | Conta GL principal de compra/gasto |
| DT_REGISTO | Sim | Data de registo |
| DT_ALTERACAO | Sim | Data de alteração |
| ESTADO | Sim | Estado do registo |

## 8.5. pr_imposto

Esta tabela substitui a abordagem limitada da antiga pr_iva. O objetivo é suportar imposto percentual e imposto de valor fixo.

| Campo | Obrig. | Descrição |
| --- | --- | --- |
| ID | Sim | Identificador único |
| CODIGO | Sim | Código do imposto |
| DESIG | Sim | Designação do imposto |
| DESCR | Não | Descrição complementar |
| TIPO_CALCULO | Sim | PERCENTAGEM ou VALOR_FIXO |
| VALOR | Não | Taxa ou montante padrão |
| APLICA_RETENCAO | Não | Indicador de retenção |
| CONTA_GL_ID | Não | Conta GL do imposto |
| ESTADO | Sim | Estado do registo |

## 8.6. fatura_venda

A fatura de venda deve ser o documento central do processo de venda. Deve deixar de depender obrigatoriamente da tabela venda.

| Campo | Obrig. | Descrição |
| --- | --- | --- |
| ID | Sim | Identificador único |
| CODIGO | Sim | Número interno/sequencial do documento |
| CODIGO_REFERENCIA | Não | Referência externa ou documental |
| TIPO_FATURA | Sim | Tipo de documento |
| DT_FATURACAO | Sim | Data do documento |
| LIMIT_FATURACAO | Não | Prazo/condição de faturação, se aplicável |
| DT_VENCIMENTO_FATURA | Não | Data de vencimento |
| ESTADO | Sim | Estado do documento |
| PAGO | Sim | Indicador de documento liquidado |
| DESCONTO_FINANCEIRO | Não | Total de desconto financeiro |
| DESCONTO_COMERCIAL | Não | Total de desconto comercial |
| VALOR_ILIQUIDO | Sim | Total antes de descontos e impostos |
| VALOR_IMPOSTO | Sim | Total de imposto |
| VALOR_FATURA | Sim | Total final do documento |
| VALOR_PAGO | Sim | Valor já regularizado |
| VALOR_POR_PAGAR | Sim | Saldo em aberto |
| Fatura_venda_ID | Não | Documento de referência/origem |
| TERM_CONDICOES | Não | Termos e condições |
| NOTA | Não | Notas livres |
| CLIENTE_ID | Sim | Cliente do documento |
| pr_serie_ID | Sim | Série documental |
| UTILIZADOR | Sim | Utilizador responsável |
| DT_REGISTO | Sim | Data de registo |
| DT_ALTERACAO | Sim | Data de alteração |

Devem ser removidos do core, nesta fase, campos técnicos como UUID, DFE_ENVIADO, ESTADO_PE, MOTIVO_DOC_REGEITADO e outros elementos ligados à integração fiscal eletrónica.

## 8.7. fatura_venda_item

| Campo | Obrig. | Descrição |
| --- | --- | --- |
| ID | Sim | Identificador único |
| FATURA_VENDA_ID | Sim | Cabeçalho da fatura |
| NUM_LINHA | Sim | Número ordinal da linha |
| PRODUTO_ID | Não | Produto/serviço de origem |
| CODIGO_ARTIGO | Não | Código do artigo copiado para a linha |
| DESIG | Sim | Descrição curta da linha |
| DESCR | Não | Descrição longa da linha |
| QUANTIDADE | Sim | Quantidade faturada |
| pr_unidade_ID | Não | Unidade usada na linha |
| PRECO_UNITARIO | Sim | Preço unitário efetivo |
| DESCONTO_COMERCIAL_PERC | Não | Percentagem de desconto comercial |
| DESCONTO_COMERCIAL_VALOR | Não | Montante do desconto comercial |
| DESCONTO_FINANCEIRO_PERC | Não | Percentagem de desconto financeiro |
| DESCONTO_FINANCEIRO_VALOR | Não | Montante do desconto financeiro |
| VALOR_BRUTO | Sim | Quantidade x preço unitário |
| VALOR_LIQUIDO | Sim | Base líquida da linha |
| VALOR_IMPOSTO | Sim | Valor total do imposto da linha |
| VALOR_TOTAL | Sim | Total final da linha |
| CONTA_GL_ID | Não | Conta GL aplicável à linha |
| DT_REGISTO | Sim | Data de registo |
| DT_ALTERACAO | Sim | Data de alteração |
| ESTADO | Sim | Estado da linha |

## 8.8. fatura_venda_item_imposto

Tabela necessária para representar o imposto efetivamente aplicado à linha, independentemente da configuração padrão do produto.

| Campo | Obrig. | Descrição |
| --- | --- | --- |
| ID | Sim | Identificador único |
| FATURA_VENDA_ITEM_ID | Sim | Linha da fatura |
| IMPOSTO_ID | Sim | Imposto aplicado |
| TIPO_CALCULO | Sim | PERCENTAGEM ou VALOR_FIXO |
| TAXA | Não | Taxa percentual aplicada |
| VALOR_FIXO | Não | Valor fixo aplicado |
| BASE_CALCULO | Sim | Base de incidência |
| VALOR_IMPOSTO | Sim | Montante do imposto |
| MOTIVO_NAO_APLICAR_IMPOSTO | Não | Motivo de isenção/não aplicação |
| CONTA_GL_ID | Não | Conta GL do imposto |
| ORDEM | Não | Ordem do imposto na linha |

## 8.9. fatura_compra e tabelas associadas

As tabelas fatura_compra, fatura_compra_item e fatura_compra_item_imposto devem repetir a mesma lógica funcional da venda, ajustada ao fornecedor e ao ciclo de compras. A modelação deve ser paralela para reduzir complexidade e facilitar manutenção.

## 8.10. pagamento

A tabela pagamento deve representar apenas o evento de pagamento. A relação entre pagamentos e documentos deve ser feita na tabela pagamento_documento.

| Campo | Obrig. | Descrição |
| --- | --- | --- |
| ID | Sim | Identificador único |
| CODIGO | Sim | Código interno do pagamento |
| BANCO | Não | Banco ou referência bancária |
| VALOR_PAGAMENTO | Sim | Montante pago |
| NUM_DOCUMENTO | Não | Número do documento de suporte |
| TIPO_PAGAMENTO | Sim | Tipo/método de pagamento |
| AGENCIA_ID | Não | Agência/canal, se aplicável |
| AXEXO_COMPROVATIVO | Não | Anexo de comprovativo |
| NOTA | Não | Notas do pagamento |
| DT_PAGAMENTO | Sim | Data do pagamento |
| UTILIZADOR | Sim | Utilizador responsável |
| DT_REGISTO | Sim | Data de registo |
| DT_ALTERACAO | Sim | Data de alteração |
| ESTADO | Sim | Estado do registo |
| CODIGO_REFERENCIA | Não | Referência externa |

## 8.11. pagamento_documento

| Campo | Obrig. | Descrição |
| --- | --- | --- |
| ID | Sim | Identificador único |
| PAGAMENTO_ID | Sim | Pagamento de origem |
| FATURA_VENDA_ID | Não | Documento de venda liquidado |
| FATURA_COMPRA_ID | Não | Documento de compra liquidado |
| VALOR_APLICADO | Sim | Montante aplicado ao documento |
| DESCONTO_FINANCEIRO_APLICADO | Não | Desconto financeiro na regularização |
| REGULARIZACAO_REF_COD | Não | Código de referência da regularização |
| DT_REGISTO | Sim | Data de registo |

## 8.12. gl_conta

Tabela mínima necessária para preparar o módulo para futura integração contabilística. Não implica ainda a existência de diários ou lançamentos contabilísticos.

| Campo | Obrig. | Descrição |
| --- | --- | --- |
| ID | Sim | Identificador único |
| CODIGO | Sim | Código da conta |
| DESIG | Sim | Designação da conta |
| DESCR | Não | Descrição complementar |
| TIPO_CONTA | Sim | Ativo, Passivo, Capital, Rendimento, Gasto |
| CONTA_PAI_ID | Não | Conta superior na hierarquia |
| ACEITA_LANCAMENTO | Sim | Indicador de conta movimentável |
| DT_REGISTO | Sim | Data de registo |
| DT_ALTERACAO | Sim | Data de alteração |
| ESTADO | Sim | Estado da conta |

# 9. Relacionamentos essenciais

- cliente 1:N fatura_venda
- fornecedor 1:N fatura_compra
- fatura_venda 1:N fatura_venda_item
- fatura_compra 1:N fatura_compra_item
- fatura_venda_item 1:N fatura_venda_item_imposto
- fatura_compra_item 1:N fatura_compra_item_imposto
- pagamento 1:N pagamento_documento
- fatura_venda 1:N pagamento_documento
- fatura_compra 1:N pagamento_documento
- produto 1:N fatura_venda_item e 1:N fatura_compra_item
- pr_imposto 1:N fatura_venda_item_imposto e 1:N fatura_compra_item_imposto
- gl_conta 1:N produto, cliente, fornecedor, pr_imposto e linhas documentais
# 11. Requisitos não funcionais mínimos

- O modelo deve garantir integridade referencial por chaves estrangeiras entre tabelas mestre, parametrizações e documentos.
- Os valores monetários devem usar tipos decimais apropriados e nunca tipos float.
- As operações de geração de número documental devem ser transacionais, evitando duplicação de número em concorrência.
- O sistema deve manter campos de auditoria mínimos: data de registo, data de alteração, utilizador e estado, sempre que aplicável.
- As tabelas de linhas e impostos devem ser indexadas pelos respetivos IDs de documento para leitura rápida do documento completo.
- O sistema deve permitir expansão futura para stock, contas correntes, diário contabilístico e integração fiscal sem refatoração estrutural profunda.
# 12. Entregáveis esperados da equipa de desenvolvimento

- Modelo relacional físico com CREATE TABLE, PK, FK, índices e restrições de unicidade.
- Serviços de domínio para cadastros, emissão de documentos, cálculo de linhas e regularização de pagamentos.
- Mecanismo transacional de geração de número por série.
- Camada de validação de regras de negócio do documento e das linhas.
- Estrutura preparada para futura integração com módulo contabilístico e módulo fiscal eletrónico.
# 13. Conclusão

O módulo core de faturação deverá ser desenvolvido como um núcleo transacional autónomo, centrado no documento comercial e preparado para crescer de forma controlada para ERP completo. A modelação proposta preserva a base conceptual e parte da nomenclatura da estrutura anterior, mas corrige os pontos críticos: dependência de multiempresa na mesma base de dados, ausência de linhas formais de documento, limitação do imposto apenas a IVA percentual, acoplamento excessivo entre pagamento e fatura e falta de preparação para contas GL.

A implementação deve seguir esta estrutura como baseline de desenvolvimento. Qualquer adaptação adicional deverá preservar os princípios definidos neste documento: clareza do domínio, integridade relacional, separação entre core de negócio e integração fiscal, e preparação real para evolução contabilística futura.

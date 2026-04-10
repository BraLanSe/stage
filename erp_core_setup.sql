-- ================================================================
-- eFatura Core - Script de inicialização da base de dados
-- Módulo Core de Faturação v1.0
-- ================================================================

-- PARAMETRIZAÇÕES
CREATE TABLE IF NOT EXISTS pr_fatura_tipo (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    desig VARCHAR(100) NOT NULL,
    descr TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS pr_serie (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    desig VARCHAR(100),
    pr_fatura_tipo_id INTEGER REFERENCES pr_fatura_tipo(id),
    contador INTEGER NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS pr_unidade (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    desig VARCHAR(50) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS pr_categoria (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    desig VARCHAR(100) NOT NULL,
    descr TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS pr_moeda (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(3) NOT NULL UNIQUE,
    desig VARCHAR(50) NOT NULL,
    simbolo VARCHAR(5),
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS pr_enquadramento (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    desig VARCHAR(100) NOT NULL,
    descr TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS pr_metodo_pagamento (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    desig VARCHAR(100) NOT NULL,
    descr TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS pr_imposto (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    desig VARCHAR(100) NOT NULL,
    descr TEXT,
    tipo_calculo VARCHAR(20) NOT NULL CHECK (tipo_calculo IN ('PERCENTAGEM', 'VALOR_FIXO')),
    valor DECIMAL(10,4),
    aplica_retencao BOOLEAN NOT NULL DEFAULT FALSE,
    conta_gl_id INTEGER,
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

-- CONTABILIDADE (preparação)
CREATE TABLE IF NOT EXISTS gl_conta (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    desig VARCHAR(150) NOT NULL,
    descr TEXT,
    tipo_conta VARCHAR(20) NOT NULL CHECK (tipo_conta IN ('ATIVO', 'PASSIVO', 'CAPITAL', 'RENDIMENTO', 'GASTO')),
    conta_pai_id INTEGER REFERENCES gl_conta(id),
    aceita_lancamento BOOLEAN NOT NULL DEFAULT TRUE,
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

-- CADASTROS MESTRE
CREATE TABLE IF NOT EXISTS entidade (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    desig VARCHAR(150) NOT NULL,
    descr TEXT,
    nif VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(20),
    endereco TEXT,
    geografia_id INTEGER,
    pr_enquadramento_id INTEGER REFERENCES pr_enquadramento(id),
    pr_moeda_id INTEGER REFERENCES pr_moeda(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS cliente (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    ind_coletivo BOOLEAN NOT NULL DEFAULT FALSE,
    desig VARCHAR(150) NOT NULL,
    descr TEXT,
    nif VARCHAR(20),
    num_cliente VARCHAR(20),
    email VARCHAR(150),
    telefone VARCHAR(20),
    geografia_id INTEGER,
    pais VARCHAR(3),
    endereco TEXT,
    pessoa_contacto VARCHAR(150),
    aplicar_impostos BOOLEAN NOT NULL DEFAULT TRUE,
    motivo_nao_aplicar_imposto TEXT,
    pr_enquadramento_id INTEGER REFERENCES pr_enquadramento(id),
    conta_gl_id INTEGER REFERENCES gl_conta(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS fornecedor (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    ind_coletivo BOOLEAN NOT NULL DEFAULT FALSE,
    desig VARCHAR(150) NOT NULL,
    descr TEXT,
    nif VARCHAR(20),
    num_cliente VARCHAR(20),
    email VARCHAR(150),
    telefone VARCHAR(20),
    geografia_id INTEGER,
    pais VARCHAR(3),
    endereco TEXT,
    pessoa_contacto VARCHAR(150),
    aplicar_impostos BOOLEAN NOT NULL DEFAULT TRUE,
    motivo_nao_aplicar_imposto TEXT,
    pr_enquadramento_id INTEGER REFERENCES pr_enquadramento(id),
    conta_gl_id INTEGER REFERENCES gl_conta(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS produto (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    desig VARCHAR(150) NOT NULL,
    descr TEXT,
    pr_categoria_id INTEGER REFERENCES pr_categoria(id),
    pr_unidade_id INTEGER REFERENCES pr_unidade(id),
    preco DECIMAL(18,2),
    imposto_venda_id INTEGER REFERENCES pr_imposto(id),
    imposto_compra_id INTEGER REFERENCES pr_imposto(id),
    desconto_comercial DECIMAL(5,2),
    controlar_stock BOOLEAN DEFAULT FALSE,
    conta_gl_id INTEGER REFERENCES gl_conta(id),
    conta_gl_compra_id INTEGER REFERENCES gl_conta(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

-- FATURAS DE VENDA
CREATE TABLE IF NOT EXISTS fatura_venda (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    codigo_referencia VARCHAR(50),
    tipo_fatura_id INTEGER NOT NULL REFERENCES pr_fatura_tipo(id),
    dt_faturacao DATE NOT NULL,
    limit_faturacao DATE,
    dt_vencimento_fatura DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO',
    pago BOOLEAN NOT NULL DEFAULT FALSE,
    desconto_financeiro DECIMAL(18,2) NOT NULL DEFAULT 0,
    desconto_comercial DECIMAL(18,2) NOT NULL DEFAULT 0,
    valor_iliquido DECIMAL(18,2) NOT NULL DEFAULT 0,
    valor_imposto DECIMAL(18,2) NOT NULL DEFAULT 0,
    valor_fatura DECIMAL(18,2) NOT NULL DEFAULT 0,
    valor_pago DECIMAL(18,2) NOT NULL DEFAULT 0,
    valor_por_pagar DECIMAL(18,2) NOT NULL DEFAULT 0,
    fatura_venda_id INTEGER REFERENCES fatura_venda(id),
    term_condicoes TEXT,
    nota TEXT,
    cliente_id INTEGER NOT NULL REFERENCES cliente(id),
    pr_serie_id INTEGER NOT NULL REFERENCES pr_serie(id),
    utilizador VARCHAR(100) NOT NULL,
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_fatura_venda_cliente ON fatura_venda(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fatura_venda_estado ON fatura_venda(estado);

CREATE TABLE IF NOT EXISTS fatura_venda_item (
    id SERIAL PRIMARY KEY,
    fatura_venda_id INTEGER NOT NULL REFERENCES fatura_venda(id),
    num_linha INTEGER NOT NULL,
    produto_id INTEGER REFERENCES produto(id),
    codigo_artigo VARCHAR(20),
    desig VARCHAR(150) NOT NULL,
    descr TEXT,
    quantidade DECIMAL(18,4) NOT NULL,
    pr_unidade_id INTEGER REFERENCES pr_unidade(id),
    preco_unitario DECIMAL(18,4) NOT NULL,
    desconto_comercial_perc DECIMAL(5,4),
    desconto_comercial_valor DECIMAL(18,4),
    desconto_financeiro_perc DECIMAL(5,4),
    desconto_financeiro_valor DECIMAL(18,4),
    valor_bruto DECIMAL(18,4) NOT NULL,
    valor_liquido DECIMAL(18,4) NOT NULL,
    valor_imposto DECIMAL(18,4) NOT NULL DEFAULT 0,
    valor_total DECIMAL(18,4) NOT NULL,
    conta_gl_id INTEGER REFERENCES gl_conta(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_fatura_venda_item_fatura ON fatura_venda_item(fatura_venda_id);

CREATE TABLE IF NOT EXISTS fatura_venda_item_imposto (
    id SERIAL PRIMARY KEY,
    fatura_venda_item_id INTEGER NOT NULL REFERENCES fatura_venda_item(id),
    imposto_id INTEGER NOT NULL REFERENCES pr_imposto(id),
    tipo_calculo VARCHAR(20) NOT NULL CHECK (tipo_calculo IN ('PERCENTAGEM', 'VALOR_FIXO')),
    taxa DECIMAL(5,4),
    valor_fixo DECIMAL(18,4),
    base_calculo DECIMAL(18,4) NOT NULL,
    valor_imposto DECIMAL(18,4) NOT NULL,
    motivo_nao_aplicar_imposto TEXT,
    conta_gl_id INTEGER REFERENCES gl_conta(id),
    ordem INTEGER
);
CREATE INDEX IF NOT EXISTS idx_fvi_imposto_item ON fatura_venda_item_imposto(fatura_venda_item_id);

-- FATURAS DE COMPRA
CREATE TABLE IF NOT EXISTS fatura_compra (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    codigo_referencia VARCHAR(50),
    tipo_fatura_id INTEGER NOT NULL REFERENCES pr_fatura_tipo(id),
    dt_faturacao DATE NOT NULL,
    limit_faturacao DATE,
    dt_vencimento_fatura DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO',
    pago BOOLEAN NOT NULL DEFAULT FALSE,
    desconto_financeiro DECIMAL(18,2) NOT NULL DEFAULT 0,
    desconto_comercial DECIMAL(18,2) NOT NULL DEFAULT 0,
    valor_iliquido DECIMAL(18,2) NOT NULL DEFAULT 0,
    valor_imposto DECIMAL(18,2) NOT NULL DEFAULT 0,
    valor_fatura DECIMAL(18,2) NOT NULL DEFAULT 0,
    valor_pago DECIMAL(18,2) NOT NULL DEFAULT 0,
    valor_por_pagar DECIMAL(18,2) NOT NULL DEFAULT 0,
    fatura_compra_id INTEGER REFERENCES fatura_compra(id),
    term_condicoes TEXT,
    nota TEXT,
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedor(id),
    pr_serie_id INTEGER NOT NULL REFERENCES pr_serie(id),
    utilizador VARCHAR(100) NOT NULL,
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_fatura_compra_fornecedor ON fatura_compra(fornecedor_id);

CREATE TABLE IF NOT EXISTS fatura_compra_item (
    id SERIAL PRIMARY KEY,
    fatura_compra_id INTEGER NOT NULL REFERENCES fatura_compra(id),
    num_linha INTEGER NOT NULL,
    produto_id INTEGER REFERENCES produto(id),
    codigo_artigo VARCHAR(20),
    desig VARCHAR(150) NOT NULL,
    descr TEXT,
    quantidade DECIMAL(18,4) NOT NULL,
    pr_unidade_id INTEGER REFERENCES pr_unidade(id),
    preco_unitario DECIMAL(18,4) NOT NULL,
    desconto_comercial_perc DECIMAL(5,4),
    desconto_comercial_valor DECIMAL(18,4),
    desconto_financeiro_perc DECIMAL(5,4),
    desconto_financeiro_valor DECIMAL(18,4),
    valor_bruto DECIMAL(18,4) NOT NULL,
    valor_liquido DECIMAL(18,4) NOT NULL,
    valor_imposto DECIMAL(18,4) NOT NULL DEFAULT 0,
    valor_total DECIMAL(18,4) NOT NULL,
    conta_gl_id INTEGER REFERENCES gl_conta(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_fatura_compra_item_fatura ON fatura_compra_item(fatura_compra_id);

CREATE TABLE IF NOT EXISTS fatura_compra_item_imposto (
    id SERIAL PRIMARY KEY,
    fatura_compra_item_id INTEGER NOT NULL REFERENCES fatura_compra_item(id),
    imposto_id INTEGER NOT NULL REFERENCES pr_imposto(id),
    tipo_calculo VARCHAR(20) NOT NULL CHECK (tipo_calculo IN ('PERCENTAGEM', 'VALOR_FIXO')),
    taxa DECIMAL(5,4),
    valor_fixo DECIMAL(18,4),
    base_calculo DECIMAL(18,4) NOT NULL,
    valor_imposto DECIMAL(18,4) NOT NULL,
    motivo_nao_aplicar_imposto TEXT,
    conta_gl_id INTEGER REFERENCES gl_conta(id),
    ordem INTEGER
);
CREATE INDEX IF NOT EXISTS idx_fci_imposto_item ON fatura_compra_item_imposto(fatura_compra_item_id);

-- PAGAMENTOS
CREATE TABLE IF NOT EXISTS pagamento (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    banco VARCHAR(100),
    valor_pagamento DECIMAL(18,2) NOT NULL,
    num_documento VARCHAR(50),
    tipo_pagamento_id INTEGER NOT NULL REFERENCES pr_metodo_pagamento(id),
    agencia_id INTEGER,
    anexo_comprovativo VARCHAR(255),
    nota TEXT,
    dt_pagamento DATE NOT NULL,
    utilizador VARCHAR(100) NOT NULL,
    codigo_referencia VARCHAR(50),
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_date TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_date TIMESTAMP,
    last_modified_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS pagamento_documento (
    id SERIAL PRIMARY KEY,
    pagamento_id INTEGER NOT NULL REFERENCES pagamento(id),
    fatura_venda_id INTEGER REFERENCES fatura_venda(id),
    fatura_compra_id INTEGER REFERENCES fatura_compra(id),
    valor_aplicado DECIMAL(18,2) NOT NULL,
    desconto_financeiro_aplicado DECIMAL(18,2),
    regularizacao_ref_cod VARCHAR(50),
    dt_registo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pagamento_documento_pagamento ON pagamento_documento(pagamento_id);

-- DADOS INICIAIS
INSERT INTO pr_moeda (codigo, desig, simbolo, estado) VALUES ('CVE', 'Escudo Cabo-Verdiano', 'CVE', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_moeda (codigo, desig, simbolo, estado) VALUES ('EUR', 'Euro', '€', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_moeda (codigo, desig, simbolo, estado) VALUES ('USD', 'Dólar Americano', '$', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;

INSERT INTO pr_fatura_tipo (codigo, desig, estado) VALUES ('FT', 'Fatura', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_fatura_tipo (codigo, desig, estado) VALUES ('FR', 'Fatura-Recibo', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_fatura_tipo (codigo, desig, estado) VALUES ('ND', 'Nota de Débito', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_fatura_tipo (codigo, desig, estado) VALUES ('NC', 'Nota de Crédito', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;

INSERT INTO pr_unidade (codigo, desig, estado) VALUES ('UN', 'Unidade', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_unidade (codigo, desig, estado) VALUES ('KG', 'Quilograma', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_unidade (codigo, desig, estado) VALUES ('LT', 'Litro', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_unidade (codigo, desig, estado) VALUES ('HR', 'Hora', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;

INSERT INTO pr_metodo_pagamento (codigo, desig, estado) VALUES ('NU', 'Numerário', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_metodo_pagamento (codigo, desig, estado) VALUES ('TR', 'Transferência Bancária', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_metodo_pagamento (codigo, desig, estado) VALUES ('CH', 'Cheque', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_metodo_pagamento (codigo, desig, estado) VALUES ('MB', 'Referência Multibanco', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;

INSERT INTO pr_imposto (codigo, desig, tipo_calculo, valor, aplica_retencao, estado) VALUES ('IVA15', 'IVA 15%', 'PERCENTAGEM', 15.0000, FALSE, 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_imposto (codigo, desig, tipo_calculo, valor, aplica_retencao, estado) VALUES ('IVA8', 'IVA 8%', 'PERCENTAGEM', 8.0000, FALSE, 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_imposto (codigo, desig, tipo_calculo, valor, aplica_retencao, estado) VALUES ('ISENTO', 'Isento', 'PERCENTAGEM', 0.0000, FALSE, 'ATIVO') ON CONFLICT (codigo) DO NOTHING;

INSERT INTO pr_enquadramento (codigo, desig, estado) VALUES ('GEN', 'Geral', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_enquadramento (codigo, desig, estado) VALUES ('ISE', 'Isento', 'ATIVO') ON CONFLICT (codigo) DO NOTHING;

INSERT INTO pr_serie (codigo, desig, pr_fatura_tipo_id, contador, estado) VALUES ('FT-2026', 'Série Faturas 2026', (SELECT id FROM pr_fatura_tipo WHERE codigo='FT'), 0, 'ATIVO') ON CONFLICT (codigo) DO NOTHING;
INSERT INTO pr_serie (codigo, desig, pr_fatura_tipo_id, contador, estado) VALUES ('FR-2026', 'Série Faturas-Recibo 2026', (SELECT id FROM pr_fatura_tipo WHERE codigo='FR'), 0, 'ATIVO') ON CONFLICT (codigo) DO NOTHING;

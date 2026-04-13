package cv.igrp.fatura.venda.infrastructure.persistence.entity;

import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.ClienteEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrFaturaTipoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrSerieEntity;
import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "fatura_venda")
public class FaturaVendaEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(name = "codigo", nullable = false, length = 20)
    private String codigo;

    @Column(name = "codigo_referencia")
    private String codigoReferencia;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_fatura_id", nullable = false)
    private PrFaturaTipoEntity tipoFatura;

    @NotNull
    @Column(name = "dt_faturacao", nullable = false)
    private LocalDate dtFaturacao;

    @Column(name = "limit_faturacao")
    private LocalDate limitFaturacao;

    @Column(name = "dt_vencimento_fatura")
    private LocalDate dtVencimentoFatura;

    @Column(name = "dt_confirmacao")
    private LocalDate dtConfirmacao;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "RASCUNHO";

    @NotNull
    @Column(name = "pago", nullable = false)
    private Boolean pago = false;

    @Column(name = "desconto_financeiro", nullable = false, precision = 18, scale = 2)
    private BigDecimal descontoFinanceiro = BigDecimal.ZERO;

    @Column(name = "desconto_comercial", nullable = false, precision = 18, scale = 2)
    private BigDecimal descontoComercial = BigDecimal.ZERO;

    @Column(name = "valor_iliquido", nullable = false, precision = 18, scale = 2)
    private BigDecimal valorIliquido = BigDecimal.ZERO;

    @Column(name = "valor_imposto", nullable = false, precision = 18, scale = 2)
    private BigDecimal valorImposto = BigDecimal.ZERO;

    @Column(name = "valor_fatura", nullable = false, precision = 18, scale = 2)
    private BigDecimal valorFatura = BigDecimal.ZERO;

    @Column(name = "valor_pago", nullable = false, precision = 18, scale = 2)
    private BigDecimal valorPago = BigDecimal.ZERO;

    @Column(name = "valor_por_pagar", nullable = false, precision = 18, scale = 2)
    private BigDecimal valorPorPagar = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fatura_venda_id")
    private FaturaVendaEntity faturaVendaOrigem;

    @Column(name = "term_condicoes")
    private String termCondicoes;

    @Column(name = "nota")
    private String nota;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private ClienteEntity cliente;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pr_serie_id", nullable = false)
    private PrSerieEntity prSerie;

    @NotBlank
    @Column(name = "utilizador", nullable = false, length = 100)
    private String utilizador = "system";

    @JsonIgnoreProperties("faturaVenda")
    @OneToMany(mappedBy = "faturaVenda", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FaturaVendaItemEntity> items = new ArrayList<>();
}

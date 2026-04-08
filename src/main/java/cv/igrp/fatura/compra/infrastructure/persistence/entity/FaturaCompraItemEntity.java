package cv.igrp.fatura.compra.infrastructure.persistence.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.ProdutoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrUnidadeEntity;
import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "fatura_compra_item")
public class FaturaCompraItemEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fatura_compra_id", nullable = false)
    private FaturaCompraEntity faturaCompra;

    @NotNull
    @Column(name = "num_linha", nullable = false)
    private Integer numLinha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id")
    private ProdutoEntity produto;

    @Column(name = "codigo_artigo", length = 20)
    private String codigoArtigo;

    @NotBlank
    @Column(name = "desig", nullable = false, length = 150)
    private String desig;

    @Column(name = "descr")
    private String descr;

    @NotNull
    @Column(name = "quantidade", nullable = false, precision = 18, scale = 4)
    private BigDecimal quantidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pr_unidade_id")
    private PrUnidadeEntity prUnidade;

    @NotNull
    @Column(name = "preco_unitario", nullable = false, precision = 18, scale = 4)
    private BigDecimal precoUnitario;

    @Column(name = "desconto_comercial_perc", precision = 5, scale = 4)
    private BigDecimal descontoComercialPerc;

    @Column(name = "desconto_comercial_valor", precision = 18, scale = 4)
    private BigDecimal descontoComercialValor;

    @Column(name = "desconto_financeiro_perc", precision = 5, scale = 4)
    private BigDecimal descontoFinanceiroPerc;

    @Column(name = "desconto_financeiro_valor", precision = 18, scale = 4)
    private BigDecimal descontoFinanceiroValor;

    @NotNull
    @Column(name = "valor_bruto", nullable = false, precision = 18, scale = 4)
    private BigDecimal valorBruto;

    @NotNull
    @Column(name = "valor_liquido", nullable = false, precision = 18, scale = 4)
    private BigDecimal valorLiquido;

    @NotNull
    @Column(name = "valor_imposto", nullable = false, precision = 18, scale = 4)
    private BigDecimal valorImposto;

    @NotNull
    @Column(name = "valor_total", nullable = false, precision = 18, scale = 4)
    private BigDecimal valorTotal;

    @Column(name = "conta_gl_id")
    private Integer contaGlId;

    @Column(name = "estado", nullable = false)
    private String estado = "ATIVO";

    @OneToMany(mappedBy = "faturaCompraItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FaturaCompraItemImpostoEntity> impostos = new ArrayList<>();
}

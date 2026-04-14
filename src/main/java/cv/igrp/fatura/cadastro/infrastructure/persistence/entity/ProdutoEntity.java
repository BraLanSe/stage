package cv.igrp.fatura.cadastro.infrastructure.persistence.entity;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrCategoriaEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrImpostoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrUnidadeEntity;
import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "produto")
public class ProdutoEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(name = "codigo", nullable = false, length = 20)
    private String codigo;

    @NotBlank
    @Column(name = "desig", nullable = false, length = 150)
    private String desig;

    @Column(name = "descr")
    private String descr;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pr_categoria_id")
    private PrCategoriaEntity prCategoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pr_unidade_id")
    private PrUnidadeEntity prUnidade;

    @Column(name = "preco", precision = 18, scale = 2)
    private BigDecimal preco;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "imposto_venda_id")
    private PrImpostoEntity impostoVenda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "imposto_compra_id")
    private PrImpostoEntity impostoCompra;

    @Column(name = "desconto_comercial", precision = 5, scale = 2)
    private BigDecimal descontoComercial;

    @Column(name = "controlar_stock")
    private Boolean controlarStock = false;

    @Column(name = "conta_gl_id")
    private Integer contaGlId;

    @Column(name = "conta_gl_compra_id")
    private Integer contaGlCompraId;

    @Column(name = "estado", nullable = false)
    private String estado = "ATIVO";
}

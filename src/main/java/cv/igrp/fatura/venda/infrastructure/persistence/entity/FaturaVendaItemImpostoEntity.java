package cv.igrp.fatura.venda.infrastructure.persistence.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrImpostoEntity;
import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "fatura_venda_item_imposto")
public class FaturaVendaItemImpostoEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fatura_venda_item_id", nullable = false)
    private FaturaVendaItemEntity faturaVendaItem;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "imposto_id", nullable = false)
    private PrImpostoEntity imposto;

    @NotBlank
    @Column(name = "tipo_calculo", nullable = false)
    private String tipoCalculo; // PERCENTAGEM or VALOR_FIXO

    @Column(name = "taxa", precision = 18, scale = 4)
    private BigDecimal taxa;

    @Column(name = "valor_fixo", precision = 18, scale = 4)
    private BigDecimal valorFixo;

    @NotNull
    @Column(name = "base_calculo", nullable = false, precision = 18, scale = 4)
    private BigDecimal baseCalculo;

    @NotNull
    @Column(name = "valor_imposto", nullable = false, precision = 18, scale = 4)
    private BigDecimal valorImposto;

    @Column(name = "motivo_nao_aplicar_imposto")
    private String motivoNaoAplicarImposto;

    @Column(name = "conta_gl_id")
    private Integer contaGlId;

    @Column(name = "ordem")
    private Integer ordem;
}

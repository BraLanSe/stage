package cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity;

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
@Table(name = "pr_imposto")
public class PrImpostoEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(name = "codigo", nullable = false, unique = true, length = 10)
    private String codigo;

    @NotBlank
    @Column(name = "desig", nullable = false, length = 100)
    private String desig;

    @Column(name = "descr")
    private String descr;

    @NotBlank
    @Column(name = "tipo_calculo", nullable = false)
    private String tipoCalculo; // PERCENTAGEM or VALOR_FIXO

    @Column(name = "valor", precision = 10, scale = 4)
    private BigDecimal valor;

    @Column(name = "aplica_retencao", nullable = false)
    private Boolean aplicaRetencao = false;

    @Column(name = "conta_gl_id")
    private Integer contaGlId;

    @Column(name = "estado", nullable = false)
    private String estado = "ATIVO";
}

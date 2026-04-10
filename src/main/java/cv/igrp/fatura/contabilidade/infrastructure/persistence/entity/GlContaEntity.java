package cv.igrp.fatura.contabilidade.infrastructure.persistence.entity;

import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "gl_conta")
public class GlContaEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(name = "codigo", nullable = false, unique = true, length = 20)
    private String codigo;

    @NotBlank
    @Column(name = "desig", nullable = false, length = 150)
    private String desig;

    @Column(name = "descr")
    private String descr;

    @NotBlank
    @Column(name = "tipo_conta", nullable = false)
    private String tipoConta; // ATIVO, PASSIVO, CAPITAL, RENDIMENTO, GASTO

    @Column(name = "conta_pai_id")
    private Integer contaPaiId;

    @NotNull
    @Column(name = "aceita_lancamento", nullable = false)
    private Boolean aceitaLancamento = true;

    @Column(name = "estado", nullable = false)
    private String estado = "ATIVO";
}

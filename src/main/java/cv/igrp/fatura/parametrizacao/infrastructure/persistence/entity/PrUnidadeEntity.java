package cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity;

import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pr_unidade")
public class PrUnidadeEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(name = "codigo", nullable = false, unique = true, length = 10)
    private String codigo;

    @NotBlank
    @Column(name = "desig", nullable = false, length = 50)
    private String desig;

    @Column(name = "estado", nullable = false)
    private String estado = "ATIVO";
}

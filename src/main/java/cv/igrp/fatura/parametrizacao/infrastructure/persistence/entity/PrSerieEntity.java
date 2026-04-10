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
@Table(name = "pr_serie")
public class PrSerieEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(name = "codigo", nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(name = "desig", length = 100)
    private String desig;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pr_fatura_tipo_id")
    private PrFaturaTipoEntity prFaturaTipo;

    @Column(name = "contador")
    private Integer contador = 0;

    @Column(name = "estado", nullable = false)
    private String estado = "ATIVO";
}

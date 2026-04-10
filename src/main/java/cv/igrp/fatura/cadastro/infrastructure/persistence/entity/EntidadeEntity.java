package cv.igrp.fatura.cadastro.infrastructure.persistence.entity;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrEnquadramentoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrMoedaEntity;
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
@Table(name = "entidade")
public class EntidadeEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(name = "codigo", nullable = false, length = 10)
    private String codigo;

    @NotBlank
    @Column(name = "desig", nullable = false, length = 150)
    private String desig;

    @Column(name = "descr")
    private String descr;

    @NotBlank
    @Column(name = "nif", nullable = false, unique = true, length = 20)
    private String nif;

    @Column(name = "email")
    private String email;

    @Column(name = "telefone")
    private String telefone;

    @Column(name = "endereco")
    private String endereco;

    @Column(name = "geografia_id")
    private Integer geografiaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pr_enquadramento_id")
    private PrEnquadramentoEntity prEnquadramento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pr_moeda_id")
    private PrMoedaEntity prMoeda;

    @Column(name = "estado", nullable = false)
    private String estado = "ATIVO";
}

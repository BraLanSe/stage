package cv.igrp.fatura.cadastro.infrastructure.persistence.entity;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrEnquadramentoEntity;
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
@Table(name = "cliente")
public class ClienteEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(name = "codigo", nullable = false, length = 10)
    private String codigo;

    @NotNull
    @Column(name = "ind_coletivo", nullable = false)
    private Boolean indColetivo = false;

    @NotBlank
    @Column(name = "desig", nullable = false, length = 150)
    private String desig;

    @Column(name = "descr")
    private String descr;

    @Column(name = "nif", length = 20)
    private String nif;

    @Column(name = "num_cliente", length = 20)
    private String numCliente;

    @Column(name = "email")
    private String email;

    @Column(name = "telefone")
    private String telefone;

    @Column(name = "geografia_id")
    private Integer geografiaId;

    @Column(name = "pais", length = 3)
    private String pais;

    @Column(name = "endereco")
    private String endereco;

    @Column(name = "pessoa_contacto")
    private String pessoaContacto;

    @NotNull
    @Column(name = "aplicar_impostos", nullable = false)
    private Boolean aplicarImpostos = true;

    @Column(name = "motivo_nao_aplicar_imposto")
    private String motivoNaoAplicarImposto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pr_enquadramento_id")
    private PrEnquadramentoEntity prEnquadramento;

    @Column(name = "conta_gl_id")
    private Integer contaGlId;

    @Column(name = "estado", nullable = false)
    private String estado = "ATIVO";
}

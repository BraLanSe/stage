package cv.igrp.fatura.pagamento.infrastructure.persistence.entity;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrMetodoPagamentoEntity;
import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pagamento")
public class PagamentoEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(name = "codigo", nullable = false, length = 20)
    private String codigo;

    @Column(name = "banco", length = 100)
    private String banco;

    @NotNull
    @Column(name = "valor_pagamento", nullable = false, precision = 18, scale = 2)
    private BigDecimal valorPagamento;

    @Column(name = "num_documento", length = 50)
    private String numDocumento;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_pagamento_id", nullable = false)
    private PrMetodoPagamentoEntity tipoPagamento;

    @Column(name = "agencia_id")
    private Integer agenciaId;

    @Column(name = "anexo_comprovativo", length = 255)
    private String anexoComprovativo;

    @Column(name = "nota")
    private String nota;

    @NotNull
    @Column(name = "dt_pagamento", nullable = false)
    private LocalDate dtPagamento;

    @NotBlank
    @Column(name = "utilizador", nullable = false, length = 100)
    private String utilizador;

    @Column(name = "codigo_referencia", length = 50)
    private String codigoReferencia;

    @Column(name = "estado", nullable = false)
    private String estado = "ATIVO";
}

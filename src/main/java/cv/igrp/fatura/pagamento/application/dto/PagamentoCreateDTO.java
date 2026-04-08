package cv.igrp.fatura.pagamento.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class PagamentoCreateDTO {

    @NotBlank
    private String codigo;

    private String banco;

    @NotNull
    private BigDecimal valorPagamento;

    private String numDocumento;

    @NotNull
    private Integer tipoPagamentoId;

    private Integer agenciaId;

    private String anexoComprovativo;

    private String nota;

    @NotNull
    private LocalDate dtPagamento;

    @NotBlank
    private String utilizador;

    private String codigoReferencia;

    private String estado;
}

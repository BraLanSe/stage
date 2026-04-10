package cv.igrp.fatura.pagamento.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

    // Documents auxquels ce paiement est appliqué (spec RF-09, §8.11)
    private List<PagamentoDocumentoDTO> documentos = new ArrayList<>();
}

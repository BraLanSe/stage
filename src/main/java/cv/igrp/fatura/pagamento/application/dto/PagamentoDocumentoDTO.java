package cv.igrp.fatura.pagamento.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class PagamentoDocumentoDTO {

    private Integer faturaVendaId;

    private Integer faturaCompraId;

    @NotNull
    private BigDecimal valorAplicado;

    private BigDecimal descontoFinanceiroAplicado;

    private String regularizacaoRefCod;

    private LocalDateTime dtRegisto;
}

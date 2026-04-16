package cv.igrp.fatura.venda.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class FaturaVendaItemImpostoDTO {

    @NotNull
    private Integer impostoId;

    // Optional — inherited from PrImpostoEntity.tipoCalculo when absent
    private String tipoCalculo; // PERCENTAGEM or VALOR_FIXO

    // Optional — inherited from PrImpostoEntity.valor when absent
    private BigDecimal taxa;

    // Optional — inherited from PrImpostoEntity.valor when absent
    private BigDecimal valorFixo;

    // Optional — defaults to item valorLiquido when absent
    private BigDecimal baseCalculo;

    // Optional — computed by backend when absent (PERCENTAGEM: base*taxa/100, VALOR_FIXO: valorFixo)
    private BigDecimal valorImposto;

    private String motivoNaoAplicarImposto;

    private Integer contaGlId;

    private Integer ordem;
}

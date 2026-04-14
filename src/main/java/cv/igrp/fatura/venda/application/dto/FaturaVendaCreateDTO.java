package cv.igrp.fatura.venda.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class FaturaVendaCreateDTO {

    private String codigoReferencia;

    @NotNull
    private Integer tipoFaturaId;

    @NotNull
    private LocalDate dtFaturacao;

    private LocalDate limitFaturacao;

    private LocalDate dtVencimentoFatura;

    @NotNull
    private Integer clienteId;

    @NotNull
    private Integer prSerieId;

    private String termCondicoes;

    private String nota;

    @NotNull
    @Size(min = 1)
    private List<FaturaVendaItemDTO> items = new ArrayList<>();
}

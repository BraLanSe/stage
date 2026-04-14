package cv.igrp.fatura.compra.application.dto;

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
public class FaturaCompraCreateDTO {

    private String codigoReferencia;

    @NotNull
    private Integer tipoFaturaId;

    @NotNull
    private LocalDate dtFaturacao;

    private LocalDate limitFaturacao;

    private LocalDate dtVencimentoFatura;

    @NotNull
    private Integer fornecedorId;

    @NotNull
    private Integer prSerieId;

    private String termCondicoes;

    private String nota;

    @NotNull
    @Size(min = 1)
    private List<FaturaCompraItemDTO> items = new ArrayList<>();
}

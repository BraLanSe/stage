package cv.igrp.fatura.venda.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@IgrpDTO
public class FaturaVendaAtualizarDTO {
    private Integer clienteId;
    private String nota;
    private String termCondicoes;
    private List<FaturaVendaItemAtualizarDTO> items = new ArrayList<>();
}

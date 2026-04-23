package cv.igrp.fatura.compra.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@IgrpDTO
public class FaturaCompraAtualizarDTO {
    private Integer fornecedorId;
    private String nota;
    private String termCondicoes;
    private List<FaturaCompraItemAtualizarDTO> items = new ArrayList<>();
}

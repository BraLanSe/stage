package cv.igrp.fatura.venda.application.commands;

import cv.igrp.framework.core.domain.Command;
import cv.igrp.fatura.venda.application.dto.FaturaVendaCreateDTO;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFaturaVendaCommand implements Command {

    @NotNull
    private Integer id;

    @NotNull
    private FaturaVendaCreateDTO dto;
}

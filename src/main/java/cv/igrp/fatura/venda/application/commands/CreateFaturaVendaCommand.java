package cv.igrp.fatura.venda.application.commands;

import cv.igrp.framework.core.domain.Command;
import cv.igrp.fatura.venda.application.dto.FaturaVendaCreateDTO;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFaturaVendaCommand implements Command {

    @NotNull
    private FaturaVendaCreateDTO dto;
}

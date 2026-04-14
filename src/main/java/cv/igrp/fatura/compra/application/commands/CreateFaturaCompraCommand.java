package cv.igrp.fatura.compra.application.commands;

import cv.igrp.framework.core.domain.Command;
import cv.igrp.fatura.compra.application.dto.FaturaCompraCreateDTO;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFaturaCompraCommand implements Command {

    @NotNull
    private FaturaCompraCreateDTO dto;
}

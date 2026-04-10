package cv.igrp.fatura.venda.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.framework.core.domain.CommandBus;
import cv.igrp.fatura.venda.application.commands.ConfirmarFaturaVendaCommand;
import cv.igrp.fatura.venda.application.commands.CreateFaturaVendaCommand;
import cv.igrp.fatura.venda.application.dto.FaturaVendaCreateDTO;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@IgrpController
@RestController
@RequestMapping("api/v1/faturas-venda")
@RequiredArgsConstructor
@Tag(name = "FaturaVenda", description = "Gestão de faturas de venda")
public class FaturaVendaController {

    private final CommandBus commandBus;
    private final FaturaVendaRepository faturaVendaRepo;

    @GetMapping
    @Operation(summary = "Listar faturas de venda")
    public ResponseEntity<List<FaturaVendaEntity>> list() {
        return ResponseEntity.ok(faturaVendaRepo.findAll());
    }

    @PostMapping
    @Operation(summary = "Criar fatura de venda")
    public ResponseEntity<FaturaVendaEntity> create(@RequestBody @Valid FaturaVendaCreateDTO dto) {
        return commandBus.send(new CreateFaturaVendaCommand(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter fatura de venda por ID")
    public ResponseEntity<FaturaVendaEntity> getById(@PathVariable Integer id) {
        return faturaVendaRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar fatura de venda")
    public ResponseEntity<FaturaVendaEntity> confirmar(@PathVariable Integer id) {
        return commandBus.send(new ConfirmarFaturaVendaCommand(id));
    }

    @PutMapping("/{id}/anular")
    @Operation(summary = "Anular fatura de venda")
    public ResponseEntity<FaturaVendaEntity> anular(@PathVariable Integer id) {
        return faturaVendaRepo.findById(id).map(f -> {
            f.setEstado("ANULADO");
            return ResponseEntity.ok(faturaVendaRepo.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }
}

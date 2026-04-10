package cv.igrp.fatura.compra.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.framework.core.domain.CommandBus;
import cv.igrp.fatura.compra.application.commands.CreateFaturaCompraCommand;
import cv.igrp.fatura.compra.application.dto.FaturaCompraCreateDTO;
import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/faturas-compra", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "FaturaCompra", description = "Gestão de faturas de compra")
public class FaturaCompraController {

    private final CommandBus commandBus;
    private final FaturaCompraRepository faturaCompraRepo;

    @GetMapping
    @Operation(summary = "Listar faturas de compra")
    public ResponseEntity<Page<FaturaCompraEntity>> list(Pageable pageable) {
        return ResponseEntity.ok(faturaCompraRepo.findAll(pageable));
    }

    @PostMapping
    @Operation(summary = "Criar fatura de compra")
    public ResponseEntity<FaturaCompraEntity> create(@RequestBody @Valid FaturaCompraCreateDTO dto) {
        return commandBus.send(new CreateFaturaCompraCommand(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter fatura de compra por ID")
    public ResponseEntity<FaturaCompraEntity> getById(@PathVariable Integer id) {
        return faturaCompraRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar fatura de compra")
    public ResponseEntity<FaturaCompraEntity> confirmar(@PathVariable Integer id) {
        return faturaCompraRepo.findById(id).map(f -> {
            f.setEstado("CONFIRMADO");
            return ResponseEntity.ok(faturaCompraRepo.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/anular")
    @Operation(summary = "Anular fatura de compra")
    public ResponseEntity<FaturaCompraEntity> anular(@PathVariable Integer id) {
        return faturaCompraRepo.findById(id).map(f -> {
            f.setEstado("ANULADO");
            return ResponseEntity.ok(faturaCompraRepo.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }
}

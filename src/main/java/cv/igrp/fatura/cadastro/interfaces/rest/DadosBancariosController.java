package cv.igrp.fatura.cadastro.interfaces.rest;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.DadosBancariosEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.DadosBancariosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/v1/dados-bancarios")
@RequiredArgsConstructor
public class DadosBancariosController {
    private final DadosBancariosRepository repo;
    @GetMapping
    public List<DadosBancariosEntity> listar() { return repo.findAll(); }
    @PostMapping
    public DadosBancariosEntity salvar(@RequestBody DadosBancariosEntity d) { return repo.save(d); }
    @DeleteMapping("/{id}")
    public void supprimer(@PathVariable Integer id) { repo.deleteById(id); }
}
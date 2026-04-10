package cv.igrp.fatura.shared.config;

import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.ClienteEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.FornecedorEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.ProdutoEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ClienteRepository;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.FornecedorRepository;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ClienteRepository clienteRepository;
    private final FornecedorRepository fornecedorRepository;
    private final ProdutoRepository produtoRepository;

    @Override
    public void run(String... args) {
        log.info("🚀 [SEEDER] Démarrage du remplissage des données...");

        seedClientes();
        seedFornecedores();
        seedProdutos();

        log.info("✅ [SEEDER] Données insérées avec succès");
    }

    private void seedClientes() {
        if (clienteRepository.count() > 0) return;

        var c1 = new ClienteEntity();
        c1.setCodigo("CLI-100001");
        c1.setDesig("Empresa Alpha Lda");
        c1.setIndColetivo(true);
        c1.setNif("123456789");
        c1.setEmail("alpha@empresa.cv");
        c1.setTelefone("9911000");
        c1.setPais("CPV");
        c1.setAplicarImpostos(true);

        var c2 = new ClienteEntity();
        c2.setCodigo("CLI-100002");
        c2.setDesig("João Silva");
        c2.setIndColetivo(false);
        c2.setNif("987654321");
        c2.setEmail("joao.silva@mail.cv");
        c2.setTelefone("9922000");
        c2.setPais("CPV");
        c2.setAplicarImpostos(true);

        var c3 = new ClienteEntity();
        c3.setCodigo("CLI-100003");
        c3.setDesig("Beta Comércio SA");
        c3.setIndColetivo(true);
        c3.setNif("111222333");
        c3.setEmail("beta@comercio.cv");
        c3.setTelefone("9933000");
        c3.setPais("CPV");
        c3.setAplicarImpostos(false);
        c3.setMotivoNaoAplicarImposto("Isento por diploma legal");

        clienteRepository.saveAll(List.of(c1, c2, c3));
    }

    private void seedFornecedores() {
        if (fornecedorRepository.count() > 0) return;

        var f1 = new FornecedorEntity();
        f1.setCodigo("FOR-100001");
        f1.setDesig("Fornecedor Global SA");
        f1.setIndColetivo(true);
        f1.setNif("444555666");
        f1.setEmail("global@fornecedor.cv");
        f1.setTelefone("9944000");
        f1.setPais("CPV");
        f1.setAplicarImpostos(true);

        var f2 = new FornecedorEntity();
        f2.setCodigo("FOR-100002");
        f2.setDesig("Distribuidora Norte");
        f2.setIndColetivo(true);
        f2.setNif("777888999");
        f2.setEmail("norte@distribuidora.cv");
        f2.setTelefone("9955000");
        f2.setPais("CPV");
        f2.setAplicarImpostos(true);

        fornecedorRepository.saveAll(List.of(f1, f2));
    }

    private void seedProdutos() {
        if (produtoRepository.count() > 0) return;

        var p1 = new ProdutoEntity();
        p1.setCodigo("PRD-10001");
        p1.setDesig("Computador Portátil");
        p1.setDescr("Laptop 15 polegadas, 16GB RAM, 512GB SSD");
        p1.setPreco(new BigDecimal("85000.00"));

        var p2 = new ProdutoEntity();
        p2.setCodigo("PRD-10002");
        p2.setDesig("Monitor 24\"");
        p2.setDescr("Monitor Full HD, 60Hz");
        p2.setPreco(new BigDecimal("32000.00"));

        var p3 = new ProdutoEntity();
        p3.setCodigo("PRD-10003");
        p3.setDesig("Serviço de Consultoria");
        p3.setDescr("Hora de consultoria técnica");
        p3.setPreco(new BigDecimal("5000.00"));

        produtoRepository.saveAll(List.of(p1, p2, p3));
    }
}

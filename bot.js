/* ==========================================================
 * Robô de Wallstreet - v 1.0.3
 * ==========================================================
 * Desenvolvido por: Arthur Henrique
 * E-mail: arthurhenrique@live.com
 * Github: SilvioDoMine
 */

/*
TODO: As compras e vendas estão funcionando paralelamente, ou seja, ao mesmo tempo. Isto é um problema
quando existem diversos recursos para comprar ao mesmo tempo, ou diversos para vender ao mesmo tempo,
ou diversos para comprar e vender ao mesmo tempo. Aqui precisamos fazer com que a função de compra seja
assíncrona, de forma que ele aguarde a função anterior ser completa, antes de executar a próxima. Isso vai
evitar os erros atuais que ocorrem.
- Possível solução: usar funções assíncronas do javascript (async functions) junto com Promise e Await

TODO: Atualmente, a compra de recursos está com um pouco de problema, no qual faz a compra ser maior que a
esperada. Pois o sistema fica mais caro toda vez que você compra uma unidade, e esse pequeno valor extra
faz com que seja comprado uma unidade a mais, e as vezes, gasta um comerciante a mais. 
- Possível solução: usar um cálculo matemático para reduzir uma porcentagem do valor do input. Exemplo:
Se a compra vai ser de 2200, reduzir para 2000. O próprio TW recalcula pra você.
*/

/* **************
    Configs
**************** */
var venderQuando    = 5000;  // A partir de quanto pode começar a vender recursos? Se digitar 0, desabilita a venda.
var comprarQuando   = 1100; // A partir de quanto pode começar a comprar recursos? Se digitar 0, desabilita a compra.
var maxTransacoes   = 1;    // Você vai definir nas configurações a quantidade de transação máxima, por compra ou venda.
var tempoDeReacao   = 10000;//  1Tempo de reação para cada update em mili-segundos.
var modoDebug       = true; // Deseja ativar o modo de debug, com mais detalhes? True ou False;

/*********** End config *******/

// Declarações de variáveis para uso futuro
var madeiraDaAldeia;
var argilaDaAldeia;
var ferroDaAldeia;
var armazemDaAldeia;
var ppDaAldeia;
var madeiraValue;
var argilaValue;
var ferroValue;
var comerciantesAtualValue;
var comerciantesTotalValue;
// Salva em variáveis os campos de input, e os botões para uso futuro
var fieldComprarMadeira = $('input.premium-exchange-input').eq(0);
var fieldComprarArgila  = $('input.premium-exchange-input').eq(1);
var fieldComprarFerro   = $('input.premium-exchange-input').eq(2);
var fieldVenderMadeira  = $('input.premium-exchange-input').eq(3);
var fieldVenderArgila   = $('input.premium-exchange-input').eq(4);
var fieldVenderFerro    = $('input.premium-exchange-input').eq(5);$('input.btn-premium-exchange-buy');
var calcularOferta      = $('input.btn-premium-exchange-buy');

// Função que envia mensagem para o usuário
// Somente se ele tiver ativado o modo debug
// Senão, apenas mostra a transação clean
function consoleDebug($msg) {

    if (modoDebug) {
        console.log($msg);
    }
}

// Essa função gera um número em mili segundos
// Entre 1000 e 3000 ser usado como click da plataforma.
// Isso ajuda para que não detectem nossa atividade como bot
// Pois se clicarmos muito rápido, ou sempre na mesma velocidade
// É muito fácil para detectar como bot. Desta forma, a velocidade
// De click sempre vai ser diferente.
function generateTimeBetweenClicks() {
  return Math.floor(Math.random() * 3000) + 1000;
}

// Função que atualiza os valores a cada tick
// Essa função é executada em loop infinito a 
// cada x segundos, definidos na config no tempoDeReacao
function valuesUpdate() {

    // Pega a quantidade de recursos e armazem que você possui.
    madeiraDaAldeia = parseInt($('#wood').text());
    argilaDaAldeia  = parseInt($('#stone').text());
    ferroDaAldeia   = parseInt($('#iron').text());
    ppDaAldeia      = parseInt($('#premium_points').text());
    armazemDaAldeia = parseInt($('#storage').text());

    consoleDebug('Sua madeira: ' + madeiraDaAldeia + ' Sua argila: ' + argilaDaAldeia + ' Seu ferro: ' + ferroDaAldeia + ' Pontos Premium: ' + ppDaAldeia + ' Armazém: ' + armazemDaAldeia);

    // Pega os valores em recursos da bolsa e armazena-os nas respectivas variaveis.
    madeiraValue    = parseInt($('div.premium-exchange-sep').eq(0).text());
    argilaValue     = parseInt($('div.premium-exchange-sep').eq(3).text());
    ferroValue      = parseInt($('div.premium-exchange-sep').eq(6).text());

    // Recebe os status dos seus comerciantes, e armazena-os nas respectivas variaveis.
    comerciantesAtualValue = parseInt($('#market_merchant_available_count').text());
    comerciantesTotalValue = parseInt($('#market_merchant_total_count').text());

    console.log('Preço madeira: ' + madeiraValue + " Preço argila: " + argilaValue + " Preço ferro: " + ferroValue + " Comerciantes: " + comerciantesAtualValue + "/" + comerciantesTotalValue);

}

// Função utilizada para cancelar o loop infinito
// a qualquer momento, ainda não se sabe para que
// vamos utilizar, mas é sempre bom ter a opção.
function stopLoop() {

    consoleDebug('Cancelando loop infinito agora!');
    // Cancela o loop infinito.
    clearInterval(window);
}

// Função que faz o cálculo final se devemos ou não
// Comprar o recurso, e então, compramos.
function comprarRecurso(recursoType) {
    // Nota: Lembrar de atualizar número de comerciantes após fazer a compra/venda.
    // NOTA: Ideia boa que tive antes de dormir, ao invés de comprar vários de vez, comprar apenas 1 por vez.
    
    // Declarando variáveis para uso futuro.
    var quantidadeCompra = 0;
    var vezesCompra = 0;
    var recursoValue;
    var recursoDaAldeia;
    var inputComprar;

    /* ========================================================
    /   Verificação para saber com qual recurso vamos trabalhar
    /  ======================================================== */    
    
    switch(recursoType) {
        case 'madeira':
            recursoValue = madeiraValue;
            recursoDaAldeia = madeiraDaAldeia;
            inputComprar = fieldComprarMadeira;
            break;
        case 'argila':
            recursoValue = argilaValue;
            recursoDaAldeia = argilaDaAldeia;
            inputComprar = fieldComprarArgila;
            break;
        case 'ferro':
            recursoValue = ferroValue;
            recursoDaAldeia = ferroDaAldeia;
            inputComprar = fieldComprarFerro;
            break;
        default:
            recursoValue = 0;
            recursoDaAldeia = 0;
    }

    // Um pouco de programação defensiva, que é para que se o usuário tentar editar
    // o código, e tiver feito uma "cagada", que não quebre o código inteiro.
    // Se o recursoValue ou recursoDaAldeia forem 0 (ou seja, caso default), então
    // quer dizer que o usuário editou o código e colocou um recurso que não existe
    // logo, abandona a compra pois vai dar errado!
    if (recursoValue == 0 && recursoDaAldeia == 0) {
        consoleDebug('Amigão, você editou o código e digitou um recurso inválido na função comprarRecurso(). Se ligue aí!');
        return false;
    }


    /* ========================================================
    /   Verificação de Pontos Premium
    /  ======================================================== */
    // SÓ POR SEGURANÇA: Se por acaso, a quantidade de pontos premium
    // for zero (o que nunca deve acontecer) já cancela a compra daqui mesmo.
    if (ppDaAldeia == 0) {
        consoleDebug('Você não tem pontos premium.');
        return false;
    }

    // Vamos comprar a quantidade de recursos igual a quantidade de pontos premium
    // Pois o usuário pode ter 1 ou 2 pontos premium. Porém há um problema, e se o 
    // Usuário tiver 100 pontos prêmium, vamos comprar 100? Não. É por isso que 
    // temos o maxTransacoes, e nós iremos checar isso no proximo if.
    if (ppDaAldeia > 0) {
        vezesCompra = ppDaAldeia;
    }
    
    // Se possuírmos mais pontos premium que o limite de transações, vamos limitar
    // o número de compra ao limite de transações, isto é maxTransacoes.
    if (ppDaAldeia >= maxTransacoes) {
        vezesCompra = maxTransacoes;
    }
    
    // Vamos descobrir agora exatamente quanto de recurso nós iremos comprar.
    // Esse cálculo é simples, preço da madeira multiplicado pelo número de
    // vezes que decidimos comprar acima. EX: Preco = 500, Vezes = 2 => quantidadeCompra = 1000;
    quantidadeCompra = recursoValue * vezesCompra;

    /* ========================================================
    /   Verificação do Comerciante
    /  ======================================================== */
    // Agora vamos calcular se temos comerciantes suficientes!
    // Se a quantidade de comerciantes atuais multiplicado por 1000
    // (pois cada comerciante carrega no máximo 1000 recursos)
    // for menor que a quantidade de compra, previamente estabelecida
    // então não podemos comprar. Vamos recalcular a quantidade máxima.
    /*
    if ((comerciantesAtualValue * 1000) <= quantidadeCompra) {
        consoleDebug('Seus comerciantes não tem capacidade suficiente para comprar tudo que foi estipulado! Vamos recalcular?');

        // TRADUZINDO A LÓGICA MATEMÁTICA: Vamos fazer uma repetição entre os valores a quantidade de compra, começando
        // do maior para o menor. EX: O preço do recurso está 500. Vamos comprar 5 vezes, isso daria 2500. Porém, só temos
        // 1 comerciante disponível. Isso dá 1000. Então vamos verificar se 500x4 (2000) igual ou menor que 1000? Não. 
        // 500x3 (1500) igual ou menor que 1000? Não. 500x2 (1000) igual ou menor que mil? SIM! Então vamos comprar.
        for(var i = (vezesCompra - 1); i >= 0; i--) {

            quantidadeCompra = recursoValue * i;

            if ((comerciantesAtualValue * 1000) >= quantidadeCompra) {
                // Já achamos o valor que queríamos.
                // Pode parar o loop agora mesmo!
                break;
            }

        }
    
    }
    */
    // Para finalizarmos a lógica do Comerciante, vamos verificar se a lógica acima não transformou
    // o valor de quantidadeCompra em zero. Pois se ele tiver transformado, quer dizer que ele varreu
    // todos os valores e não encontrou uma quantidade que o comerciante pudesse carregar. Os motivos são:
    // 1. Não existem comerciantes na aldeia.
    // 2. O preço é muito alto para que o seu comerciante consiga carregar.
    // 2 EX: Você só tem um comerciante, que carrega 1000, mas o preço do recurso está 1045.
    if (quantidadeCompra == 0) {
        // Exibe mensagem na tela, independente do modo debug.
        console.log('Infelizmente não há nenhum comerciante disponível, ou o comerciante que você tem disponível não é capaz de carregar o que você deseja.');
        
        // Sai da função de compra, retornando o valor booleano false.
        // Esse valor não será usado para nada, porém pelo menos
        // não continuará a executar o resto da lógica da função comprarMadeira().
        return false;
    }
    
    /* ========================================================
    /   Verificação do Armazem
    /  ======================================================== */
    // Agora que já temos o limite de transações possíveis baseados na quantidade de
    // Pontos Premium que o usuário possui, vamos verificar se há espaço no Armazém
    // para continuar com a transação.
    // --------------------------------------------------------------------------------------
    // Se a quantidade de madeira que você tem na aldeia, mais a quantidade de madeira que você
    // vai receber é maior que a quantidade disponível do seu armazem, então não podemos comprar.
    if ((recursoDaAldeia + quantidadeCompra) > armazemDaAldeia) {
        console.log('Infelizmente você está sem espaço no Armazém para comprar tudo.');
        console.log('Vamos calcular quanto recurso você pode comprar com o espaço restante.');
        return false;
     // Se o espaço for menor, então continuar a transação normalmente.
     } else {
         console.log('Você pode comprar normalmente! Seguir para a compra.');

        /* ========================================================
        /   Fazendo a compra agora mesmo!
        /  ======================================================== */
        // Agora que já temos a quantidade certa que vamos comprar,
        // vamos colocar para funcionar agora mesmo.
        // ========================================================
        // Primeiro de tudo, vamos limpar todos os campos de compra e venda
        // para evitar qualquer tipo de conflito futuro.
        fieldComprarMadeira.val('');
        fieldComprarArgila.val('');
        fieldComprarFerro.val('');
        
        // Segundamente, vamos setar o loop de humanizar, com o tempo
        // que foi estabelecido acima pela função generateTImeBeetweenClicks
        setTimeout(function() {
			// Para evitar erros de compras, vamos recalcular o novo valor da quantidadeCompra.
			// Vamos deixar que o próprio tribal wars corrija para o valor real.
			quantidadeCompra = quantidadeCompra - 200;
            inputComprar.val(quantidadeCompra);
            
            setTimeout(function() {
                calcularOferta.click();

                setTimeout(function() {
                    document.getElementsByClassName('btn evt-confirm-btn btn-confirm-yes')[0].click();

                }, generateTimeBetweenClicks());
            }, generateTimeBetweenClicks());
        }, generateTimeBetweenClicks());

        // Após fazer a compra, vamos clicar no botão de cancelar, só pra
        // desencargo de consciência em caso de algo der errado!
        document.getElementsByClassName('btn evt-cancel-btn btn-confirm-no')[0].click();

     }

     console.log('Você acabou de comprar ' + quantidadeCompra + ' de ' + recursoType + '. Parabéns!');
    
}

function venderRecurso(recursoType) {

    /* ========================================================
    /   Declarando variáveis para uso futuro.
    /  ======================================================== */
    var quantidadeVenda = 0;
    var vezesVenda = 0;
    var recursoValue;
    var recursoDaAldeia;
    var inputVender;

    /* ========================================================
    /   Verificação para saber com qual recurso vamos trabalhar
    /  ======================================================== */    
    switch(recursoType) {
        case 'madeira':
            recursoValue = madeiraValue;
            recursoDaAldeia = madeiraDaAldeia;
            inputVender = fieldVenderMadeira;
            break;
        case 'argila':
            recursoValue = argilaValue;
            recursoDaAldeia = argilaDaAldeia;
            inputVender = fieldVenderArgila;
            break;
        case 'ferro':
            recursoValue = ferroValue;
            recursoDaAldeia = ferroDaAldeia;
            inputVender = fieldVenderFerro;
            break;
        default:
            recursoValue = 0;
            recursoDaAldeia = 0;
    }

    // Um pouco de programação defensiva, que é para que se o usuário tentar editar
    // o código, e tiver feito uma "cagada", que não quebre o código inteiro.
    // Se o recursoValue ou recursoDaAldeia forem 0 (ou seja, caso default), então
    // quer dizer que o usuário editou o código e colocou um recurso que não existe
    // logo, abandona a venda pois vai dar errado!
    if (recursoValue == 0 && recursoDaAldeia == 0) {
        consoleDebug('Amigão, você editou o código e digitou um recurso inválido na função venderRecurso(). Se ligue aí!');
        // NOTA: Ainda é necessário fazer um tratamento aqui. Colocamos um return false para não parar o programa.
        return false;
    }

    /* ========================================================
    /  Verificação de quantas vezes vamos comprar.
    /  ======================================================== */
    // Primeiro, vamos verificar se podemos vender recursos de
    // acordo com a quantidade de vezes definida em maxTransacoes.
    quantidadeVenda = maxTransacoes * recursoValue; 

    // Se a quantidade de recursos que eu tenho na aldeia, for menor
    // que a quantidadeVenda, então, vamos recalcular!
    if (recursoDaAldeia < quantidadeVenda ) {
        console.log('Infelizmente você não possui recursos na sua aldeia suficiente para vender (' + quantidadeVenda + '). Vamos recalcular?');
    
        // TRADUZINDO A LÓGICA MATEMÁTICA: Vamos fazer uma repetição entre os valores a quantidade de venda, começando
        // do maior para o menor. EX: O preço do recurso está 500. Vamos vender 5 vezes, isso daria 2500. Porém, só temos
        // 1 comerciante disponível. Isso dá 1000. Então vamos verificar se 500x4 (2000) igual ou menor que 1000? Não. 
        // 500x3 (1500) igual ou menor que 1000? Não. 500x2 (1000) igual ou menor que mil? SIM! Então vamos vender.
        for(var i = (vezesVenda - 1); i >= 0; i--) {
            quantidadeVenda = recursoValue * i;
            vezesVenda = i;

            if (recursoDaAldeia >= quantidadeVenda) {
                break;
            }

        }

    }

    /* ========================================================
    /   Verificação do Comerciante
    /  ======================================================== */
    // Agora vamos calcular se temos comerciantes suficientes!
    // Se a quantidade de comerciantes atuais multiplicado por 1000
    // (pois cada comerciante carrega no máximo 1000 recursos)
    // for menor que a quantidade de venda, previamente estabelecida
    // então não podemos vender. Vamos recalcular a quantidade máxima.
    if ((comerciantesAtualValue * 1000) <= quantidadeVenda) {
        consoleDebug('Seus comerciantes não tem capacidade suficiente para vender tudo que foi estipulado! Vamos recalcular?');

        // TRADUZINDO A LÓGICA MATEMÁTICA: Vamos fazer uma repetição entre os valores a quantidade de venda, começando
        // do maior para o menor. EX: O preço do recurso está 500. Vamos vender 5 vezes, isso daria 2500. Porém, só temos
        // 1 comerciante disponível. Isso dá 1000. Então vamos verificar se 500x4 (2000) igual ou menor que 1000? Não. 
        // 500x3 (1500) igual ou menor que 1000? Não. 500x2 (1000) igual ou menor que mil? SIM! Então vamos vender.
        for(var i = (vezesVenda - 1); i >= 0; i--) {

            quantidadeVenda = recursoValue * i;
            vezesVenda = i;

            if ((comerciantesAtualValue * 1000) >= quantidadeVenda) {
                // Já achamos o valor que queríamos.
                // Pode parar o loop agora mesmo!
                break;
            }

        }
    
    }

    // Para finalizarmos a lógica do Comerciante, vamos verificar se a lógica acima não transformou
    // o valor de quantidadeVenda em zero. Pois se ele tiver transformado, quer dizer que ele varreu
    // todos os valores e não encontrou uma quantidade que o comerciante pudesse carregar. Os motivos são:
    // 1. Não existem comerciantes na aldeia.
    // 2. O preço é muito alto para que o seu comerciante consiga carregar.
    // 2 EX: Você só tem um comerciante, que carrega 1000, mas o preço do recurso está 1045.
    if (quantidadeVenda == 0) {
        // Exibe mensagem na tela, independente do modo debug.
        console.log('Infelizmente não há nenhum comerciante disponível, ou o comerciante que você tem disponível não é capaz de carregar o que você deseja.');
        
        // Sai da função de compra, retornando o valor booleano false.
        // Esse valor não será usado para nada, porém pelo menos
        // não continuará a executar o resto da lógica da função venderRecurso().
        return false;
    }

     /* ========================================================
    /   Fazendo a compra agora mesmo!
    /  ======================================================== */
    // Agora que já temos a quantidade certa que vamos comprar,
    // vamos colocar para funcionar agora mesmo.
    // ========================================================
    // Primeiro de tudo, vamos limpar todos os campos de compra e venda
    // para evitar qualquer tipo de conflito futuro.
    fieldVenderMadeira.val('');
    fieldVenderArgila.val('');
    fieldVenderFerro.val('');
    
    // Primeiro de tudo, vamos setar o loop de humanizar, com o tempo
    // que foi estabelecido acima pela função generateTImeBeetweenClicks
    setTimeout(function() {
        // Antes de inserir a quantidade, vamos fazer um "sanatize" no valor, para corrigir
        // a correção que o TW faz no valor final. Para isso, vamos reduzir 100 no valor final
        // da compra. O próprio TW vai fazer a correção.
        quantidadeVendaReal = quantidadeVenda - 100;

        inputVender.val(quantidadeVendaReal);
        
        setTimeout(function() {
            calcularOferta.click();

            setTimeout(function() {
                document.getElementsByClassName('btn evt-confirm-btn btn-confirm-yes')[0].click();

            }, generateTimeBetweenClicks());
        }, generateTimeBetweenClicks());
    }, generateTimeBetweenClicks());

    // Após fazer a compra, vamos clicar no botão de cancelar, só pra
    // desencargo de consciência em caso de algo der errado!
    document.getElementsByClassName('btn evt-cancel-btn btn-confirm-no')[0].click();


    console.log('Você acabou de vender ' + quantidadeVenda + ' de ' + recursoType + '. Parabéns!');


}

// Lógica se deve comprar ou vender recursos por pontos premium.
function logicaGeral() {

    // Se houver comerciantes disponíveis, então:
    if (comerciantesAtualValue > 0) {

        // Se o preço venda definido pelo usuário for maior que 0;
        // E se o preço do recurso for menor ou igual ao definido pelo usuário;
        if (venderQuando > 0 && madeiraValue <= venderQuando) {
            // E se a quantidade de recurso que eu tenho na aldeia for maior que o preço do recurso.
            if (madeiraDaAldeia >= madeiraValue) {
                // Vende os recursos!
                consoleDebug('O mercado de madeira está em baixa! Venda madeira por ' + madeiraValue + '.');
                venderRecurso('madeira');
            } else {
                // Não há recursos suficientes para realizar a compra!
                consoleDebug('O mercado de madeira está em baixa! Mas você não possui recursos o suficiente.');
            }
        }

        // Se o preço de compra definido pelo usuário não for maior que 0;
        // Se o preço do recurso for maior ou igual ao valor que eu desejo comprar;
        if (comprarQuando > 0 && madeiraValue >= comprarQuando) {
            // E se a quantidade de pontos prêmium que eu tenho na aldeia for maior que um;
            if (ppDaAldeia >= 1) {
                // Compra os recursos agora!
                consoleDebug('O mercado de madeira está em alta! Compre madeira por ' + madeiraValue + '.');
                comprarRecurso('madeira');
            } else {
                // Não há pontos premium suficientes para comprar os recursos agora!
                consoleDebug('O mercado de madeira está em alta! Porém você não possui pontos premium suficiente.');
            }
        }

        // Se o preço venda definido pelo usuário for maior que 0;
        // E se o preço do recurso for menor ou igual ao definido pelo usuário;
        if (venderQuando > 0 && argilaValue <= venderQuando) {
            // E se a quantidade de recurso que eu tenho na aldeia for maior que o preço do recurso.
            if (argilaDaAldeia >= argilaValue) {
                // Vende os recursos!
                consoleDebug('O mercado de argila está em baixa! Venda argila por ' + argilaValue + '.');
                venderRecurso('argila');
            } else {
                // Não há recursos suficientes para realizar a compra!
                consoleDebug('O mercado de argila está em baixa! Mas você não possui recursos o suficiente.');
            }
        }

        // Se o preço de compra definido pelo usuário não for maior que 0;
        // Se o preço do recurso for maior ou igual ao valor que eu desejo comprar;
        if (comprarQuando > 0 && argilaValue >= comprarQuando) {
            // E se a quantidade de pontos prêmium que eu tenho na aldeia for maior que um;
            if (ppDaAldeia >= 1) {
                // Compra os recursos agora!
                consoleDebug('O mercado de argila está em alta! Compre argila por ' + argilaValue + '.');
                comprarRecurso('argila');
            } else {
                // Não há pontos premium suficientes para comprar os recursos agora!
                consoleDebug('O mercado de argila está em alta! Porém você não possui pontos.');
            }
        }


        // Se o preço venda definido pelo usuário for maior que 0;
        // E se o preço do recurso for menor ou igual ao definido pelo usuário;
        if (venderQuando > 0 && ferroValue <= venderQuando) {
            // E se a quantidade de recurso que eu tenho na aldeia for maior que o preço do recurso.
            if (ferroDaAldeia >= ferroValue) {
                // Vende os recursos!
                consoleDebug('O mercado de ferro está em baixa! Venda ferro por ' + ferroValue + '.');
                venderRecurso('ferro');
            } else {
                // Não há recursos suficientes para realizar a compra!
                consoleDebug('O mercado de ferro está em baixa! Mas você não possui recursos o suficiente.');
            }
        }

        // Se o preço de compra definido pelo usuário não for maior que 0;
        // Se o preço do recurso for maior ou igual ao valor que eu desejo comprar;
        if (comprarQuando > 0 && ferroValue >= comprarQuando) {
            // E se a quantidade de pontos prêmium que eu tenho na aldeia for maior que um;
            if (ppDaAldeia >= 1) {
                // Compra os recursos agora!
                consoleDebug('O mercado de ferro está em alta! Compre ferro por ' + ferroValue + '.');
                comprarRecurso('ferro');
            } else {
                // Não há pontos premium suficientes para comprar os recursos agora!
                consoleDebug('O mercado de ferro está em alta! Porém você não possui pontos.');
            }
        }
    
    } else {
        // Comerciantes = 0;
        consoleDebug('Não há comerciantes disponíveis.');
    }

}

// Função principal, tudo que for executado, tem que passar por aqui. 
function main() {
    // Chama a função que atualiza todos os valores.
    valuesUpdate();
    // Chama a função que verifica se deve comprar ou vender.
    logicaGeral();
}

// Seta um loop infito, que acontece a cada x segundos.
// O tempo do loop é definido pela variavel tempoDeReacao.
window.setInterval(function(){
    // Seta o loop para acontecer dentro da função main().
    // Tudo que estiver dentro dela, será inserido dentro desse loop.
    main();

}, tempoDeReacao);

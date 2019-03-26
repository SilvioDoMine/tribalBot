/* **************
    Configs
**************** */
var comprarQuando   = 200;  // A partir de quanto pode começar a comprar recursos? Se digitar 0, desabilita a compra.
var venderQuando    = 900;  // A partir de quanto pode começar a vender recursos? Se digitar 0, desabilita a venda.
var maxComerciantes = 5; // Máximo de comerciantes utilizados em cada wipe para comprar ou vender recursos. [Ainda em development]
var tempoDeReacao   = 10000; // Tempo de reação para cada update em mili-segundos.
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

var fieldComprarMadeira = $('input.premium-exchange-input').eq(0);
var fieldComprarArgila  = $('input.premium-exchange-input').eq(1);
var fieldComprarFerro   = $('input.premium-exchange-input').eq(2);
var fieldVenderMadeira  = $('input.premium-exchange-input').eq(3);
var fieldVenderArgila   = $('input.premium-exchange-input').eq(4);
var fieldVenderFerro    = $('input.premium-exchange-input').eq(5);$('input.btn-premium-exchange-buy');
var calcularOferta      = $('input.btn-premium-exchange-buy');
var confirmarCompra     = $('button.btn-confirm-yes');

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

    consoleDebug('Preço madeira: ' + madeiraValue + " Preço argila: " + argilaValue + " Preço ferro: " + ferroValue + " Comerciantes: " + comerciantesAtualValue + "/" + comerciantesTotalValue);

}

// Função utilizada para cancelar o loop infinito
// a qualquer momento, ainda não se sabe para que
// vamos utilizar, mas é sempre bom ter a opção.
function stopUpdate() {

    consoleDebug('Cancelando loop infinito agora!');
    // Cancela o loop infinito.
    clearInterval();
}

// Função que faz o cálculo final se devemos ou não
// Comprar o recurso, e então, compramos.
function comprarMadeira() {
    // Nota: Lembrar de atualizar número de comerciantes após fazer a compra/venda.
    // NOTA: Ideia boa que tive antes de dormir, ao invés de comprar vários de vez, comprar apenas 1 por vez.

    var comerciantes;
    var compraMaxima;
    var compra;
    var vezes = 0;

    // Se o número de comerciantes disponíveis for maior que o número
    // de comerciantes máximo por transação, então seta que só trabalharemos
    // com o número de comerciantes estipulados.
    // Senão, apenas use a quantidade de comerciantes que estão disponível.
    if (comerciantesAtualValue >= maxComerciantes) {
        comerciantes = maxComerciantes;
    } else {
        comerciantes = comerciantesAtualValue;
    }

    // Agora que já sabemos o máximo de comerciantes que podemos usar na transação
    // Precisamos saber quanto de recurso essa quantidade de comerciante pode carregar.
    compraMaxima = comerciantes * 1000;

    // Agora que já sabemos quanto podemos carregar, vamos ver quantas vezes podemos
    // Comprar e quantos pontos premiuns gastar.
    for (var i = 0; i < compraMaxima; i = i + madeiraValue) {

        if ((i + madeiraValue) > compraMaxima) {
            break;
        }

        vezes++;
    }

    compra = vezes * madeiraValue;

    // Agora que nós sabemos quantas vezes precisamos multiplicar o preço,
    // vamos saber se temos pontos premium para continuar o processo.

    if (ppDaAldeia > vezes) {
        console.log('Pode comprar.');
    } else {
        console.log('Não pode comprar.');
    }
    
    /* ---------- Fim da lógica ------------- */

}


// Lógica se deve comprar ou vender recursos por pontos premium.
function logicaGeral() {

    // Se houver comerciantes disponíveis, então:
    if (comerciantesAtualValue > 0) {

        // Se o preço venda definido pelo usuário for maior que 0;
        // E se o preço do recurso for maior ou igual ao definido pelo usuário;
        if (venderQuando > 0 && madeiraValue >= venderQuando) {
            // E se a quantidade de pontos na aldeia for maior que um.
            if (madeiraDaAldeia >= madeiraValue) {
                // Vende os recursos!
                consoleDebug('O mercado de madeira está em alta! Venda madeira por ' + madeiraValue + '.');
                comprarMadeira();
            } else {
                // Não há recursos suficientes para realizar a compra!
                consoleDebug('O mercado de madeira está em alta! Mas você não possui recursos o suficiente.');
            }
        }

        // Se o preço de compra definido pelo usuário não for maior que 0;
        // Se o preço do recurso for menor ou igual ao valor que eu desejo comprar;
        if (comprarQuando > 0 && madeiraValue <= comprarQuando) {
            // E se a quantidade de pontos prêmium que eu tenho na aldeia for maior que um;
            if (ppDaAldeia >= 1) {
                // Compra os recursos agora!
                consoleDebug('O mercado de madeira está em baixa! Compre madeira por ' + madeiraValue + '.');
            } else {
                // Não há pontos premium suficientes para comprar os recursos agora!
                consoleDebug('O mercado de madeira está em baixa! Porém você não possui madeira suficiente.');
            }
        }

        // Se o preço venda definido pelo usuário for maior que 0;
        // E se o preço do recurso for maior ou igual ao definido pelo usuário;
        if (venderQuando > 0 && argilaValue >= venderQuando) {
            // E se a quantidade de pontos na aldeia for maior que um.
            if (madeiraDaAldeia >= argilaValue) {
                // Vende os recursos!
                consoleDebug('O mercado de argila está em alta! Venda argila por ' + argilaValue + '.');
            } else {
                // Não há recursos suficientes para realizar a compra!
                consoleDebug('O mercado de argila está em alta! Mas você não possui recursos o suficiente.');
            }
        }

        // Se o preço de compra definido pelo usuário não for maior que 0;
        // Se o preço do recurso for menor ou igual ao valor que eu desejo comprar;
        if (comprarQuando > 0 && argilaValue <= comprarQuando) {
            // E se a quantidade de pontos prêmium que eu tenho na aldeia for maior que um;
            if (ppDaAldeia >= 1) {
                // Compra os recursos agora!
                consoleDebug('O mercado de argila está em baixa! Compre argila por ' + argilaValue + '.');
            } else {
                // Não há pontos premium suficientes para comprar os recursos agora!
                consoleDebug('O mercado de argila está em baixa! Porém você não possui argila suficiente.');
            }
        }


        // Se o preço venda definido pelo usuário for maior que 0;
        // E se o preço do recurso for maior ou igual ao definido pelo usuário;
        if (venderQuando > 0 && ferroValue >= venderQuando) {
            // E se a quantidade de pontos na aldeia for maior que um.
            if (madeiraDaAldeia >= ferroValue) {
                // Vende os recursos!
                consoleDebug('O mercado de ferro está em alta! Venda ferro por ' + ferroValue + '.');
            } else {
                // Não há recursos suficientes para realizar a compra!
                consoleDebug('O mercado de ferro está em alta! Mas você não possui recursos o suficiente.');
            }
        }

        // Se o preço de compra definido pelo usuário não for maior que 0;
        // Se o preço do recurso for menor ou igual ao valor que eu desejo comprar;
        if (comprarQuando > 0 && ferroValue <= comprarQuando) {
            // E se a quantidade de pontos prêmium que eu tenho na aldeia for maior que um;
            if (ppDaAldeia >= 1) {
                // Compra os recursos agora!
                consoleDebug('O mercado de ferro está em baixa! Compre madeira por ' + ferroValue + '.');
            } else {
                // Não há pontos premium suficientes para comprar os recursos agora!
                consoleDebug('O mercado de ferro está em baixa! Porém você não possui ferro suficiente.');
            }
        }
    
    } else {
        // Comerciantes = 0;
        consoleDebug('Não há comerciantes disponíveis.');
    }

}

// Função principal, tudo que for executado, tem que passar por aqui. 
function main() {

    valuesUpdate();
    logicaGeral();
}

window.setInterval(function(){
    
    main();

}, tempoDeReacao);

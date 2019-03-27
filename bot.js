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
// Salva em variáveis os campos de input, e os botões para uso futuro
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
    var maximoTransacoes = 5; // Você vai definir nas configurações a quantidade de transação máxima, por compra ou venda.
    var quantidadeCompra = 0;
    var vezesCompra = 0;
    
    // Vamos comprar a quantidade de recursos igual a quantidade de pontos premium
    // Pois o usuário pode ter 1 ou 2 pontos premium. Porém há um problema, e se o 
    // Usuário tiver 100 pontos prêmium, vamos comprar 100? Não. É por isso que 
    // temos o maximoTransacoes, e nós iremos checar isso no proximo if.
    if (ppDaAldeia > 0) {
        vezesCompra = ppDaAldeia;
    }
    
    // Se possuírmos mais pontos premium que o limite de transações, vamos limitar
    // o número de compra ao limite de transações, isto é maximoTransacoes.
    if (ppDaAldeia >= maximoTransacoes) {
        vezesCompra = maximoTransacoes;
    }
    
    // Vamos descobrir agora exatamente quanto de recurso nós iremos comprar.
    // Esse cálculo é simples, preço da madeira multiplicado pelo número de
    // vezes que decidimos comprar acima. EX: Preco = 500, Vezes = 2 => quantidadeCompra = 1000;
    quantidadeCompra = madeiraValue * vezesCompra;
    
    // TODO: Fazer checagem se há comerciantes disponíveis baseados na quantidadeCompra
    // pois é necessário 1 comerciante a cada 1000 recursos. Se houver 0 comerciantes
    // disponíveis, então abandonaremos a transação logo aqui. Se houver mais comerciantes
    // que o necessário, então continua a transação normalmente. Se houver mais de 0 comerciantes
    // mas não hover a quantidade necessária para levar tudo, recalcular a quantidade máxima de
    // vezes que podemos comprar.
    
    // Agora que já temos o limite de transações possíveis baseados na quantidade de
    // Pontos Premium que o usuário possui, vamos verificar se há espaço no Armazém
    // para continuar com a transação.
    // --------------------------------------------------------------------------------------
    // Se a quantidade de madeira que você tem na aldeia, mais a quantidade de madeira que você
    // vai receber é maior que a quantidade disponível do seu armazem, então não podemos comprar.
    if ((madeiraDaAldeia + quantidadeCompra) > armazemDaAldeia) {
        console.log('Infelizmente você está sem espaço no Armazém para comprar tudo.');
        console.log('Vamos calcular quanto recurso você pode comprar com o espaço restante.');
     // Se o espaço for menor, então continuar a transação normalmente.
     } else {
         console.log('Você pode comprar normalmente! Seguir para a compra.');
     }
    
 
}


// Lógica se deve comprar ou vender recursos por pontos premium.
function logicaGeral() {

    // Se houver comerciantes disponíveis, então:
    if (comerciantesAtualValue > 0) {

        // Se o preço venda definido pelo usuário for maior que 0;
        // E se o preço do recurso for maior ou igual ao definido pelo usuário;
        if (venderQuando > 0 && madeiraValue >= venderQuando) {
            // E se a quantidade de recurso que eu tenho na aldeia for maior que o preço do recurso.
            if (madeiraDaAldeia >= madeiraValue) {
                // Vende os recursos!
                consoleDebug('O mercado de madeira está em alta! Venda madeira por ' + madeiraValue + '.');
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
                comprarMadeira();
            } else {
                // Não há pontos premium suficientes para comprar os recursos agora!
                consoleDebug('O mercado de madeira está em baixa! Porém você não possui madeira suficiente.');
            }
        }

        // Se o preço venda definido pelo usuário for maior que 0;
        // E se o preço do recurso for maior ou igual ao definido pelo usuário;
        if (venderQuando > 0 && argilaValue >= venderQuando) {
            // E se a quantidade de recurso que eu tenho na aldeia for maior que o preço do recurso.
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
            // E se a quantidade de recurso que eu tenho na aldeia for maior que o preço do recurso.
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

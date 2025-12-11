<template>
  <section class="space-y-16 py-8">
    <!-- Hero Section -->
    <div class="text-center space-y-6 py-12">
      <div class="inline-block px-4 py-2 bg-gold-400/20 border border-gold-400/40 rounded-full text-gold-400 text-sm font-semibold mb-4">
        Seu Catálogo Digital Sem Taxas
      </div>

      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto">
        Venda Mais Sem Depender de <span class="text-gold-400">Aplicativos de Delivery</span>
      </h1>

      <p class="text-lg sm:text-xl opacity-80 max-w-2xl mx-auto">
        Crie seu catálogo digital profissional, conecte-se direto com seus clientes pelo WhatsApp e mantenha 100% do lucro nas suas vendas.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
        <NuxtLink
          to="/login"
          class="px-8 py-4 bg-gold-400 text-black font-bold rounded-lg hover:bg-gold-300 transition-all transform hover:scale-105 shadow-xl"
        >
          Criar Meu Catálogo Grátis
        </NuxtLink>
        <NuxtLink
          to="/marketplace"
          class="px-8 py-4 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all"
        >
          Ver Lojas Cadastradas
        </NuxtLink>
      </div>
    </div>

    <!-- Problemas que Resolvemos -->
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4">Pare de Perder Dinheiro</h2>
        <p class="text-lg opacity-70">Os aplicativos de delivery cobram caro demais. Você trabalha muito para dividir seus lucros.</p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 space-y-3">
          <div class="text-3xl">💸</div>
          <h3 class="text-xl font-semibold text-red-300">Taxas Abusivas</h3>
          <p class="opacity-70">Apps cobram até 30% de comissão em cada venda. Seu lucro vai embora.</p>
        </div>

        <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 space-y-3">
          <div class="text-3xl">📱</div>
          <h3 class="text-xl font-semibold text-red-300">Sem Controle</h3>
          <p class="opacity-70">Você não tem acesso direto aos seus clientes e depende totalmente do app.</p>
        </div>

        <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 space-y-3">
          <div class="text-3xl">🏢</div>
          <h3 class="text-xl font-semibold text-red-300">Concorrência Desleal</h3>
          <p class="opacity-70">Seu negócio compete com grandes redes dentro do mesmo app.</p>
        </div>
      </div>
    </div>

    <!-- Nossa Solução -->
    <div class="max-w-5xl mx-auto bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-400/40 rounded-2xl p-8 sm:p-12">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4">A Solução é Simples</h2>
        <p class="text-lg opacity-90">Seu catálogo digital, suas regras, 100% do lucro para você.</p>
      </div>

      <div class="grid sm:grid-cols-2 gap-8">
        <div class="bg-ink-900/80 rounded-xl p-6 space-y-3 border border-white/10">
          <div class="w-12 h-12 bg-gold-400 rounded-lg flex items-center justify-center text-2xl">✅</div>
          <h3 class="text-xl font-semibold">Zero Taxas</h3>
          <p class="opacity-80">Não cobramos comissão nas suas vendas. Todo lucro é seu.</p>
        </div>

        <div class="bg-ink-900/80 rounded-xl p-6 space-y-3 border border-white/10">
          <div class="w-12 h-12 bg-gold-400 rounded-lg flex items-center justify-center text-2xl">💬</div>
          <h3 class="text-xl font-semibold">WhatsApp Direto</h3>
          <p class="opacity-80">Clientes falam diretamente com você. Construa relacionamentos reais.</p>
        </div>

        <div class="bg-ink-900/80 rounded-xl p-6 space-y-3 border border-white/10">
          <div class="w-12 h-12 bg-gold-400 rounded-lg flex items-center justify-center text-2xl">🎨</div>
          <h3 class="text-xl font-semibold">Catálogo Profissional</h3>
          <p class="opacity-80">Visual bonito e profissional que valoriza seus produtos.</p>
        </div>

        <div class="bg-ink-900/80 rounded-xl p-6 space-y-3 border border-white/10">
          <div class="w-12 h-12 bg-gold-400 rounded-lg flex items-center justify-center text-2xl">🚀</div>
          <h3 class="text-xl font-semibold">Fácil de Usar</h3>
          <p class="opacity-80">Configure em minutos. Sem complicação, sem mensalidade.</p>
        </div>
      </div>
    </div>

    <!-- Como Funciona -->
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4">Como Funciona</h2>
        <p class="text-lg opacity-70">Em 3 passos simples, você já está vendendo</p>
      </div>

      <div class="grid sm:grid-cols-3 gap-8">
        <div class="text-center space-y-4">
          <div class="w-16 h-16 bg-gold-400 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-black">1</div>
          <h3 class="text-xl font-semibold">Crie sua Conta</h3>
          <p class="opacity-70">Cadastre-se gratuitamente e configure as informações da sua loja</p>
        </div>

        <div class="text-center space-y-4">
          <div class="w-16 h-16 bg-gold-400 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-black">2</div>
          <h3 class="text-xl font-semibold">Adicione Produtos</h3>
          <p class="opacity-70">Cadastre seus produtos com fotos, descrições e preços</p>
        </div>

        <div class="text-center space-y-4">
          <div class="w-16 h-16 bg-gold-400 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-black">3</div>
          <h3 class="text-xl font-semibold">Compartilhe</h3>
          <p class="opacity-70">Divulgue seu link e comece a vender direto pelo WhatsApp</p>
        </div>
      </div>
    </div>

    <!-- Benefícios -->
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4">Vantagens para seu Negócio</h2>
      </div>

      <div class="grid sm:grid-cols-2 gap-6">
        <div class="flex gap-4 bg-ink-800 border border-white/10 rounded-xl p-6">
          <div class="text-3xl">📈</div>
          <div>
            <h3 class="text-lg font-semibold mb-2">Aumente suas Vendas</h3>
            <p class="opacity-70">Facilite o processo de compra e alcance mais clientes na sua região</p>
          </div>
        </div>

        <div class="flex gap-4 bg-ink-800 border border-white/10 rounded-xl p-6">
          <div class="text-3xl">🎯</div>
          <div>
            <h3 class="text-lg font-semibold mb-2">Fortaleça sua Marca</h3>
            <p class="opacity-70">Tenha seu próprio espaço digital com sua identidade visual</p>
          </div>
        </div>

        <div class="flex gap-4 bg-ink-800 border border-white/10 rounded-xl p-6">
          <div class="text-3xl">👥</div>
          <div>
            <h3 class="text-lg font-semibold mb-2">Fidelize Clientes</h3>
            <p class="opacity-70">Construa relacionamento direto sem intermediários</p>
          </div>
        </div>

        <div class="flex gap-4 bg-ink-800 border border-white/10 rounded-xl p-6">
          <div class="text-3xl">🏆</div>
          <div>
            <h3 class="text-lg font-semibold mb-2">Ganhe Destaque Local</h3>
            <p class="opacity-70">Seja encontrado facilmente por clientes da sua região</p>
          </div>
        </div>

        <div class="flex gap-4 bg-ink-800 border border-white/10 rounded-xl p-6">
          <div class="text-3xl">💰</div>
          <div>
            <h3 class="text-lg font-semibold mb-2">Lucro Máximo</h3>
            <p class="opacity-70">Sem taxas, sem mensalidade, sem custos ocultos</p>
          </div>
        </div>

        <div class="flex gap-4 bg-ink-800 border border-white/10 rounded-xl p-6">
          <div class="text-3xl">⚡</div>
          <div>
            <h3 class="text-lg font-semibold mb-2">Independência</h3>
            <p class="opacity-70">Não dependa de grandes plataformas para vender</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Final -->
    <div class="max-w-3xl mx-auto text-center space-y-6 bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-400/40 rounded-2xl p-12">
      <h2 class="text-3xl sm:text-4xl font-bold">Comece Agora Gratuitamente</h2>
      <p class="text-lg opacity-90">
        Junte-se a centenas de pequenos negócios que já estão vendendo mais sem taxas abusivas
      </p>
      <NuxtLink
        to="/login"
        class="inline-block px-10 py-4 bg-gold-400 text-black font-bold rounded-lg hover:bg-gold-300 transition-all transform hover:scale-105 shadow-xl text-lg"
      >
        Criar Meu Catálogo Grátis
      </NuxtLink>
      <p class="text-sm opacity-60">Sem cartão de crédito • Sem mensalidade • 100% Grátis</p>
    </div>
  </section>
</template>

<script setup lang="ts">
// SEO
useHead({
  title: 'Catálogo Digital Sem Taxas | Aldeia Viva',
  meta: [
    {
      name: 'description',
      content: 'Crie seu catálogo digital profissional e venda direto pelo WhatsApp sem taxas. Pare de perder dinheiro com apps de delivery. 100% gratuito para pequenos negócios.'
    }
  ]
})
</script>

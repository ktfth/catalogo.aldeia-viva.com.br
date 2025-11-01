#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

function fail(msg) {
  console.error('\n[Catalogo] ' + msg + '\n')
  process.exit(1)
}

// 1) Check CLI availability
const res = spawnSync('supabase', ['-v'], { encoding: 'utf-8' })
if (res.error || res.status !== 0) {
  console.error(res.stderr || '')
  fail('Supabase CLI não encontrado. Instale via:\n- macOS: brew install supabase/tap/supabase\n- Windows: scoop install supabase\n- Linux: https://supabase.com/docs/guides/cli')
}

// 2) Hint about local env
if (!existsSync('.env')) {
  console.warn('[Catalogo] Aviso: arquivo .env não encontrado. Após `supabase start`, copie `.env.example` para `.env` e ajuste PUBLIC_WHATSAPP_NUMBER.')
} else {
  try {
    const txt = readFileSync('.env', 'utf-8')
    const hasUrl = /SUPABASE_URL\s*=\s*/.test(txt)
    const hasAnon = /SUPABASE_ANON_KEY\s*=\s*/.test(txt)
    if (!hasUrl || !hasAnon) {
      console.warn('[Catalogo] Aviso: .env sem SUPABASE_URL/SUPABASE_ANON_KEY. Rode `supabase start` para gerar variáveis locais.')
    }
  } catch {}
}

process.exit(0)


import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Utensils, ArrowLeft, ListOrdered } from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  category: string;
  time: string;
  portions: string;
  ingredients: string[];
  steps: string[];
  image: string;
}

interface ModoCozinhaProps {
  recipe: Recipe;
  onVoltar: () => void;
}

export default function ModoCozinha({ recipe, onVoltar }: ModoCozinhaProps) {
  const [ingredientesChecados, setIngredientesChecados] = useState<Record<number, boolean>>({});
  const [passosChecados, setPassosChecados] = useState<Record<number, boolean>>({});

  // 🛡️ IMPLEMENTAÇÃO DO WAKE LOCK
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    async function ativarWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          // Solicita ao sistema para manter a tela ativa
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock ativado: A tela não vai apagar!');
        } catch (err) {
          console.error('Falha ao ativar o Wake Lock:', err);
        }
      } else {
        console.warn('API Wake Lock não é suportada neste navegador/dispositivo.');
      }
    }

    ativarWakeLock();

    // Função de limpeza (executada quando o usuário sai do Modo Cozinha)
    return () => {
      if (wakeLock !== null) {
        wakeLock.release()
          .then(() => {
            console.log('Wake Lock liberado com sucesso.');
          })
          .catch((err) => console.error('Erro ao liberar Wake Lock:', err));
      }
    };
  }, []); // Executa apenas uma vez ao montar o componente

  const toggleIngrediente = (index: number) => {
    setIngredientesChecados((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const togglePasso = (index: number) => {
    setPassosChecados((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50 text-slate-800 p-4 select-none">
      
      {/* Botão Superior de Voltar */}
      <button 
        onClick={onVoltar}
        className="mb-4 flex items-center gap-1 text-slate-500 font-medium text-sm active:text-orange-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para a Receita
      </button>

      {/* CABEÇALHO */}
      <header className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight break-words">
          {recipe.name}
        </h1>
        
        <div className="flex gap-4 mt-3 text-base font-bold text-slate-500">
          <span className="flex items-center gap-1.5 bg-slate-200/60 px-3 py-1 rounded-full">
            <Clock size={18} className="text-slate-600" /> {recipe.time} min
          </span>
          {recipe.portions && (
            <span className="flex items-center gap-1.5 bg-slate-200/60 px-3 py-1 rounded-full">
              <Utensils size={18} className="text-slate-600" /> {recipe.portions}
            </span>
          )}
        </div>
      </header>

      {/* SEÇÃO 1: INGREDIENTES */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 size={22} className="text-orange-500" />
          Ingredientes Separados
        </h2>
        
        {recipe.ingredients && recipe.ingredients.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhum ingrediente listado.</p>
        ) : (
          <ul className="space-y-3.5">
            {recipe.ingredients?.map((ing, index) => (
              <li key={index} className="flex items-start gap-3.5">
                <div className="flex items-center h-7">
                  <input
                    type="checkbox"
                    id={`ing-${index}`}
                    checked={!!ingredientesChecados[index]}
                    onChange={() => toggleIngrediente(index)}
                    className="w-6 h-6 rounded-lg border-2 border-slate-300 text-orange-600 focus:ring-orange-500 transition-all cursor-pointer accent-orange-500"
                  />
                </div>
                <label
                  htmlFor={`ing-${index}`}
                  className={`text-lg font-medium leading-tight cursor-pointer select-none transition-all ${
                    ingredientesChecados[index] 
                      ? 'line-through text-slate-400 font-normal' 
                      : 'text-slate-700'
                  }`}
                >
                  {ing}
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* SEÇÃO 2: MODO DE PREPARO COMPLETO */}
      <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-8">
        <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <ListOrdered size={22} className="text-orange-500" />
          Instruções de Preparo
        </h2>

        {recipe.steps && recipe.steps.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhum passo cadastrado para esta receita.</p>
        ) : (
          <div className="space-y-5">
            {recipe.steps?.map((step, index) => {
              const isChecked = !!passosChecados[index];
              return (
                <div 
                  key={index} 
                  className={`flex items-start gap-4 p-3 rounded-xl transition-all ${
                    isChecked ? 'bg-slate-50/60' : 'bg-orange-50/30 border border-orange-100/50'
                  }`}
                >
                  <button
                    onClick={() => togglePasso(index)}
                    className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center transition-all shrink-0 border-2 shadow-sm ${
                      isChecked 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'bg-white border-orange-400 text-slate-800'
                    }`}
                  >
                    {isChecked ? "✓" : index + 1}
                  </button>

                  <p
                    onClick={() => togglePasso(index)}
                    className={`text-lg font-medium leading-relaxed cursor-pointer transition-all pt-0.5 ${
                      isChecked 
                        ? 'line-through text-slate-400 font-normal' 
                        : 'text-slate-700'
                    }`}
                  >
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
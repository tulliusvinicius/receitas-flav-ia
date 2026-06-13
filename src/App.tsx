import React, { useState, useEffect } from 'react';
import { Plus, Search, ArrowLeft, Clock, ChefHat, BookOpen } from 'lucide-react';
// Importa o novo componente que criamos
import { App as CapApp } from '@capacitor/app';
import ModoCozinha from './components/ModoCozinha';

// Tipagem da Receita salva no LocalStorage
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

export default function App() {
  // 1. Atualizado: Adicionamos o estado 'cook' na navegação simples
  const [view, setView] = useState<'home' | 'category' | 'create' | 'cook'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  
  // 2. Novo estado: Guarda a receita que o usuário quer cozinhar
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  // Estados do Formulário (Sua US#001 preservada)
  const [recipeName, setRecipeName] = useState('');
  const [category, setCategory] = useState('Massas');
  const [time, setTime] = useState('');
  const [portions, setPortions] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [stepInput, setStepInput] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Categorias estáticas do sistema
  const categoriesList = ['Massas', 'Sobremesas', 'Carnes', 'Saladas', 'Lanches', 'Outros'];

  // Carregar receitas do LocalStorage ao montar o componente
  useEffect(() => {
    const saved = localStorage.getItem('recipes');
    if (saved) {
      try {
        setRecipes(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao ler LocalStorage", e);
      }
    }
  }, [view]);

  useEffect(() => {
    const backButtonListener = CapApp.addListener('backButton', (data) => {
      if (view === 'cook') {
        setView(selectedCategory ? 'category' : 'home');
      } 
      else if (view === 'category') {
        setView('home');
        setSelectedCategory('');
      } 
      else if (view === 'create') {
        setView('home');
      } 
      else if (view === 'home') {
        if (searchQuery.trim() !== '') {
          setSearchQuery('');
        } else {
          CapApp.exitApp();
        }
      }
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [view, selectedCategory, searchQuery]);

  // Contagem de receitas por categoria (Critério 1)
  const getRecipeCount = (catName: string) => {
    return recipes.filter(r => r.category.toLowerCase() === catName.toLowerCase()).length;
  };

  // Lógica de Busca Geral em tempo real (Critério 2 - Versão Protegida)
  const filteredSearchRecipes = recipes.filter(recipe => {
    const query = searchQuery.toLowerCase();
    
    // Garante que o nome existe antes de testar
    const matchName = recipe.name ? recipe.name.toLowerCase().includes(query) : false;
    
    // Garante que ingredientes existem, é um array e filtra apenas o que for string válida
    const matchIngredient = Array.isArray(recipe.ingredients) 
      ? recipe.ingredients.some(ing => typeof ing === 'string' && ing.toLowerCase().includes(query))
      : false;
      
    return matchName || matchIngredient;
  });

  // Lógica de Filtro dentro de uma Categoria Selecionada (Critério 3)
  const categoryRecipes = recipes.filter(
    r => r.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  // Ações do Formulário (US#001)
  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const handleAddStep = () => {
    if (stepInput.trim()) {
      setSteps([...steps, stepInput.trim()]);
      setStepInput('');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName || !time) return;

    const newRecipe: Recipe = {
      id: crypto.randomUUID(),
      name: recipeName,
      category,
      time,
      portions,
      ingredients,
      steps,
      image: imagePreview
    };

    const updatedRecipes = [...recipes, newRecipe];
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    setRecipes(updatedRecipes);

    // Resetar campos
    setRecipeName('');
    setCategory('Massas');
    setTime('');
    setPortions('');
    setIngredients([]);
    setSteps([]);
    setImagePreview('');

    // Voltar para a Home pós-cadastro
    setView('home');
  };

  // Função auxiliar para abrir o Modo Cozinha a partir de qualquer listagem
  const handleStartCooking = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    setView('cook');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-24">
      
      {/* 1. TELA INICIAL (HOME) */}
      {view === 'home' && (
        <div className="max-w-md mx-auto px-4 pt-6">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ChefHat className="text-orange-500 w-8 h-8" />
              Receitas da Flav
            </h1>
            <p className="text-slate-500 text-sm mt-1">O que vamos cozinhar hoje?</p>
          </div>

          {/* Barra de Busca Inteligente (Critério 2) */}
          <div className="sticky top-4 z-10 mb-6 shadow-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por receita ou ingrediente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all"
              />
              <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
            </div>
          </div>

          {/* Renderização condicional se houver texto na busca */}
          {searchQuery.trim() !== '' ? (
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                Resultados da busca ({filteredSearchRecipes.length})
              </h2>
              {filteredSearchRecipes.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-slate-100">
                  <p className="text-slate-500 text-sm">Nenhuma receita encontrada para "{searchQuery}".</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSearchRecipes.map((recipe) => (
                    <div 
                      key={recipe.id}
                      onClick={() => handleStartCooking(recipe)}
                      className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm cursor-pointer active:bg-slate-50 transition-colors"
                    >
                      {recipe.image ? (
                        <img src={recipe.image} alt={recipe.name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{recipe.name}</h4>
                        <span className="text-xs text-slate-400 block">{recipe.category} • {recipe.time} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Grid de Categorias Visual (Critério 1) */
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Categorias</h2>
              <div className="grid grid-cols-2 gap-3">
                {categoriesList.map((cat) => {
                  const count = getRecipeCount(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setView('category');
                      }}
                      className="bg-white p-5 rounded-2xl border border-slate-100 text-left transition-all active:scale-[0.98] shadow-sm hover:shadow-md group"
                    >
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mb-3 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-base block">{cat}</h3>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        {count} {count === 1 ? 'receita' : 'receitas'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. TELA DA CATEGORIA (Critério 3) */}
      {view === 'category' && (
        <div className="max-w-md mx-auto px-4 pt-6">
          <button 
            onClick={() => setView('home')}
            className="mb-4 flex items-center gap-1 text-slate-500 font-medium text-sm active:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Categorias
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900">{selectedCategory}</h1>
            <p className="text-slate-400 text-xs mt-0.5">{categoryRecipes.length} pratos salvos</p>
          </div>

          {categoryRecipes.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
              <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Nenhuma receita cadastrada em {selectedCategory} ainda.</p>
              <button 
                onClick={() => setView('create')}
                className="mt-4 text-xs font-bold text-orange-500 bg-orange-50 px-4 py-2 rounded-xl active:bg-orange-100 transition-colors"
              >
                Cadastrar Primeira
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryRecipes.map((recipe) => (
                <div 
                  key={recipe.id}
                  onClick={() => handleStartCooking(recipe)}
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm cursor-pointer active:bg-slate-50 transition-colors"
                >
                  {recipe.image ? (
                    <img src={recipe.image} alt={recipe.name} className="w-16 h-16 object-cover rounded-xl border border-slate-100" />
                  ) : (
                    <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                      <ChefHat className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-base truncate">{recipe.name}</h3>
                    <div className="flex items-center gap-3 text-slate-400 text-xs mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {recipe.time} min
                      </span>
                      {recipe.portions && (
                        <span>• {recipe.portions} porções</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. TELA DE CADASTRO (US#001 Preservada) */}
      {view === 'create' && (
        <div className="max-w-md mx-auto px-4 pt-6">
          <button 
            onClick={() => setView('home')}
            className="mb-4 flex items-center gap-1 text-slate-500 font-medium text-sm active:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Cancelar
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900">Nova Receita</h1>
            <p className="text-slate-500 text-xs mt-0.5">Cadastre suas criações rapidamente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Componente de Imagem */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
              <label className="cursor-pointer block">
                <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden max-h-48">
                    <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity">
                      Trocar Foto
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-colors">
                    <ChefHat className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span className="text-xs font-bold block text-slate-600">Adicionar foto do prato</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Tire na hora ou use a galeria</span>
                  </div>
                )}
              </label>
            </div>

            {/* Informações Básicas */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nome da Receita</label>
                <input type="text" required value={recipeName} onChange={(e) => setRecipeName(e.target.value)} placeholder="Ex: Risoto de Cogumelos" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Categoria</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
                  {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tempo (Min)</label>
                  <input type="text" inputMode="numeric" required value={time} onChange={(e) => setTime(e.target.value.replace(/\D/g, ''))} placeholder="45" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rendimento</label>
                  <input type="text" value={portions} onChange={(e) => setPortions(e.target.value)} placeholder="Ex: 4 porções" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                </div>
              </div>
            </div>

            {/* Ingredientes */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ingredientes</label>
              <div className="flex gap-2">
                <input type="text" value={ingredientInput} onChange={(e) => setIngredientInput(e.target.value)} placeholder="Ingrediente (ex: Farinha)" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                <button type="button" onClick={handleAddIngredient} className="p-2 bg-orange-500 text-white rounded-xl active:bg-orange-600 transition-colors"><Plus className="w-5 h-5" /></button>
              </div>
              {ingredients.length > 0 && (
                <ul className="text-xs space-y-1.5 pt-1 text-slate-600 list-disc pl-4">
                  {ingredients.map((ing, idx) => <li key={idx}>{ing}</li>)}
                </ul>
              )}
            </div>

            {/* Modo de Preparo */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Modo de Preparo</label>
              <div className="flex gap-2">
                <input type="text" value={stepInput} onChange={(e) => setStepInput(e.target.value)} placeholder="Passo 1" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                <button type="button" onClick={handleAddStep} className="px-3 bg-orange-500 text-white font-bold text-xs rounded-xl active:bg-orange-600 transition-colors">Próximo</button>
              </div>
              {steps.length > 0 && (
                <ol className="text-xs space-y-2 pt-1 text-slate-600 list-decimal pl-4">
                  {steps.map((step, idx) => <li key={idx} className="pl-1">{step}</li>)}
                </ol>
              )}
            </div>

            <button type="submit" className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black rounded-2xl shadow-md active:opacity-95 transition-opacity text-sm tracking-wide">
              Salvar Receita
            </button>
          </form>
        </div>
      )}

      {/* 4. TELA DO MODO COZINHA (Critérios 1, 2 e 4 integrados) */}
      {view === 'cook' && activeRecipe && (
        <ModoCozinha 
          recipe={activeRecipe} 
          onVoltar={() => {
            // Se a receita veio de uma categoria, volta para a categoria. Se veio da busca da home, volta para a home.
            setView(selectedCategory ? 'category' : 'home');
          }} 
        />
      )}

      {/* Botão Flutuante de Cadastro - FAB */}
      {view !== 'create' && view !== 'cook' && (
        <button
          onClick={() => setView('create')}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-full shadow-lg active:scale-95 transition-transform z-30"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      )}

    </div>
  );
}
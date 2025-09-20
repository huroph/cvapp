import Card3D from "./Card3D";

export default function Card3DDemo() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Démonstration des Cartes 3D
        </h1>
        
        {/* Grille de démonstration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Carte basique */}
          <Card3D>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Effet Standard
              </h3>
              <p className="text-gray-600">
                Intensité normale avec effet de lueur
              </p>
            </div>
          </Card3D>

          {/* Carte avec intensité faible */}
          <Card3D intensity={0.5} glowEffect={false}>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Effet Subtil
              </h3>
              <p className="text-gray-600">
                Intensité réduite, sans lueur
              </p>
            </div>
          </Card3D>

          {/* Carte avec intensité forte */}
          <Card3D intensity={1.5} className="bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Effet Intense
              </h3>
              <p className="text-gray-600">
                Intensité augmentée avec gradient
              </p>
            </div>
          </Card3D>

          {/* Carte sans effet 3D */}
          <Card3D enable3D={false} className="bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Effet Désactivé
              </h3>
              <p className="text-gray-600">
                Carte normale sans effet 3D
              </p>
            </div>
          </Card3D>

          {/* Carte avec effet 3D mais sans lueur */}
          <Card3D glowEffect={false} className="bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                3D sans Lueur
              </h3>
              <p className="text-gray-600">
                Effet 3D activé, lueur désactivée
              </p>
            </div>
          </Card3D>

          {/* Carte avec contenu complexe */}
          <Card3D className="md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-3xl">🚀</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Carte Étendue avec Contenu Riche
                </h3>
                <p className="text-gray-600 mb-4">
                  Cette carte démontre comment l'effet 3D fonctionne avec du contenu plus complexe et des layouts variés.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">React</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Framer Motion</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">3D Effects</span>
                </div>
              </div>
            </div>
          </Card3D>

        </div>

        {/* Instructions */}
        <div className="mt-12 text-center">
          <Card3D intensity={0.8} className="bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              💡 Instructions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong>Déplacez votre souris</strong> sur les cartes pour voir l'effet 3D en action
              </div>
              <div>
                <strong>L'intensité</strong> contrôle l'amplitude de l'effet de rotation
              </div>
              <div>
                <strong>enable3D={false}</strong> désactive complètement l'effet 3D
              </div>
            </div>
          </Card3D>
        </div>
      </div>
    </div>
  );
}
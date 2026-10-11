export interface AndroidFile {
  name: string;
  path: string;
  language: string;
  code: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/meudinheiro/app/MainActivity.kt',
    language: 'kotlin',
    code: `package com.meudinheiro.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meudinheiro.app.ui.theme.MeuDinheiroTheme
import java.text.NumberFormat
import java.util.Locale

class MainActivity : ComponentActivity() {
    private val viewModel: ExpenseViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MeuDinheiroTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen(viewModel = viewModel, onShareText = { text ->
                        val sendIntent = Intent().apply {
                            action = Intent.ACTION_SEND
                            putExtra(Intent.EXTRA_TEXT, text)
                            type = "text/plain"
                        }
                        startActivity(Intent.createChooser(sendIntent, "Compartilhar cálculo"))
                    })
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(viewModel: ExpenseViewModel, onShareText: (String) -> Unit) {
    val state by viewModel.uiState.collectAsState()
    var showHistoryDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFF10B981),
                            modifier = Modifier.size(32.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("$", fontWeight = FontWeight.Bold, color = Color.Black)
                            }
                        }
                        Spacer(Modifier.width(10.dp))
                        Text("Meu Dinheiro?", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = { showHistoryDialog = true }) {
                        Icon(Icons.Default.History, contentDescription = "Histórico", tint = Color.LightGray)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF121418))
            )
        },
        containerColor = Color(0xFF0F1012)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Formulário de Entrada
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF171A21))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("O que você gasta?", color = Color(0xFF9CA3AF), fontSize = 14.sp)
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = state.expenseName,
                        onValueChange = { viewModel.updateName(it) },
                        placeholder = { Text("Ex: Café, Delivery, Cigarro, Lanche...") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF10B981),
                            unfocusedBorderColor = Color(0xFF2C3240)
                        )
                    )

                    Spacer(Modifier.height(16.dp))
                    Text("Quanto custa a cada vez? (R$)", color = Color(0xFF9CA3AF), fontSize = 14.sp)
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = state.expenseValueString,
                        onValueChange = { viewModel.updateValueString(it) },
                        placeholder = { Text("0,00") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF10B981),
                            unfocusedBorderColor = Color(0xFF2C3240)
                        )
                    )

                    Spacer(Modifier.height(16.dp))
                    Text("Frequência de gasto", color = Color(0xFF9CA3AF), fontSize = 14.sp)
                    Spacer(Modifier.height(8.dp))

                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Frequency.values().forEach { freq ->
                            FilterChip(
                                selected = state.frequency == freq,
                                onClick = { viewModel.setFrequency(freq) },
                                label = { Text(freq.label) },
                                modifier = Modifier.weight(1f),
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color(0xFF10B981),
                                    selectedLabelColor = Color.Black
                                )
                            )
                        }
                    }

                    Spacer(Modifier.height(20.dp))
                    Button(
                        onClick = { viewModel.calculate() },
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("CALCULAR IMPACTO", fontWeight = FontWeight.Bold, color = Color(0xFF0F1012))
                    }

                    if (state.errorMessage.isNotEmpty()) {
                        Spacer(Modifier.height(8.dp))
                        Text(state.errorMessage, color = Color(0xFFEF4444), fontSize = 13.sp)
                    }
                }
            }

            // Exibição do Resultado
            state.lastResult?.let { result ->
                Spacer(Modifier.height(20.dp))
                ImpactCard(result = result, onShare = {
                    onShareText(viewModel.formatShareText(result))
                }, onReset = { viewModel.reset() })
            }
        }
    }
}
`,
  },
  {
    name: 'ExpenseViewModel.kt',
    path: 'app/src/main/java/com/meudinheiro/app/ExpenseViewModel.kt',
    language: 'kotlin',
    code: `package com.meudinheiro.app

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.meudinheiro.app.data.AppDatabase
import com.meudinheiro.app.data.ExpenseHistoryEntity
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

enum class Frequency(val label: String) {
    DIARIO("Diário"),
    SEMANAL("Semanal"),
    MENSAL("Mensal")
}

data class CalculationResult(
    val id: Long = 0,
    val name: String,
    val value: Double,
    val frequency: Frequency,
    val annual: Double,
    val monthly: Double,
    val weekly: Double,
    val reductionPercent: Int = 50,
    val savingsAnnual: Double = 0.0
)

data class UiState(
    val expenseName: String = "",
    val expenseValueString: String = "",
    val frequency: Frequency = Frequency.DIARIO,
    val errorMessage: String = "",
    val lastResult: CalculationResult? = null,
    val reductionPercent: Int = 50
)

class ExpenseViewModel(app: Application) : AndroidViewModel(app) {
    private val dao = AppDatabase.getDatabase(app).expenseDao()
    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    val history: StateFlow<List<ExpenseHistoryEntity>> = dao.getAllExpenses()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun updateName(name: String) {
        _uiState.update { it.copy(expenseName = name, errorMessage = "") }
    }

    fun updateValueString(value: String) {
        _uiState.update { it.copy(expenseValueString = value, errorMessage = "") }
    }

    fun setFrequency(freq: Frequency) {
        _uiState.update { it.copy(frequency = freq) }
    }

    fun calculate() {
        val name = _uiState.value.expenseName.trim()
        val rawValue = _uiState.value.expenseValueString.replace(",", ".").toDoubleOrNull()

        if (name.isEmpty()) {
            _uiState.update { it.copy(errorMessage = "Por favor, digite o nome do gasto (ex: Café).") }
            return
        }

        if (rawValue == null || rawValue <= 0.0) {
            _uiState.update { it.copy(errorMessage = "Informe um valor positivo válido (ex: 7,50).") }
            return
        }

        val annual = when (_uiState.value.frequency) {
            Frequency.DIARIO -> rawValue * 365.0
            Frequency.SEMANAL -> rawValue * 52.0
            Frequency.MENSAL -> rawValue * 12.0
        }

        val monthly = annual / 12.0
        val weekly = annual / 52.0
        val reduction = _uiState.value.reductionPercent
        val savings = annual * (reduction / 100.0)

        val result = CalculationResult(
            name = name,
            value = rawValue,
            frequency = _uiState.value.frequency,
            annual = annual,
            monthly = monthly,
            weekly = weekly,
            reductionPercent = reduction,
            savingsAnnual = savings
        )

        _uiState.update { it.copy(lastResult = result, errorMessage = "") }

        // Salvar offline no Room Database
        viewModelScope.launch {
            dao.insertExpense(
                ExpenseHistoryEntity(
                    name = name,
                    unitValue = rawValue,
                    frequency = _uiState.value.frequency.name,
                    annualValue = annual,
                    monthlyValue = monthly,
                    timestamp = System.currentTimeMillis()
                )
            )
        }
    }

    fun reset() {
        _uiState.update { UiState() }
    }

    fun deleteItem(id: Long) {
        viewModelScope.launch { dao.deleteById(id) }
    }

    fun formatShareText(res: CalculationResult): String {
        val ptBr = Locale("pt", "BR")
        val nf = NumberFormat.getCurrencyInstance(ptBr)
        return """
            💸 Impacto do hábito: \${res.name}
            Valor: \${nf.format(res.value)} (\${res.frequency.label})
            
            🚨 Por ano você gasta: \${nf.format(res.annual)}!
            📅 Por mês: \${nf.format(res.monthly)}
            📅 Por semana: \${nf.format(res.weekly)}
            
            💡 Reduzindo 50%, você economiza \${nf.format(res.annual / 2)} anualmente!
            
            Calculado com o app 'Meu Dinheiro?'.
        """.trimIndent()
    }
}
`,
  },
  {
    name: 'ExpenseHistoryEntity.kt',
    path: 'app/src/main/java/com/meudinheiro/app/data/ExpenseHistoryEntity.kt',
    language: 'kotlin',
    code: `package com.meudinheiro.app.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "expenses_history")
data class ExpenseHistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val unitValue: Double,
    val frequency: String,
    val annualValue: Double,
    val monthlyValue: Double,
    val timestamp: Long
)

@Dao
interface ExpenseDao {
    @Query("SELECT * FROM expenses_history ORDER BY timestamp DESC")
    fun getAllExpenses(): Flow<List<ExpenseHistoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseHistoryEntity): Long

    @Query("DELETE FROM expenses_history WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("DELETE FROM expenses_history")
    suspend fun clearAll()
}

@Entity(tableName = "custom_categories")
data class CustomCategoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val label: String,
    val icon: String,
    val defaultVal: Double,
    val frequency: String
)

@Dao
interface CategoryDao {
    @Query("SELECT * FROM custom_categories ORDER BY id DESC")
    fun getAllCategories(): Flow<List<CustomCategoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCategory(category: CustomCategoryEntity): Long

    @Query("DELETE FROM custom_categories WHERE id = :id")
    suspend fun deleteCategory(id: Long)
}
`,
  },
  {
    name: 'Theme.kt',
    path: 'app/src/main/java/com/meudinheiro/app/ui/theme/Theme.kt',
    language: 'kotlin',
    code: `package com.meudinheiro.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF10B981),        // Emerald Green
    secondary = Color(0xFF059669),
    background = Color(0xFF0F1012),     // Graphite Dark
    surface = Color(0xFF171A21),        // Elevated Graphite
    onPrimary = Color(0xFF0F1012),
    onBackground = Color(0xFFF3F4F6),
    onSurface = Color(0xFFF3F4F6)
)

@Composable
fun MeuDinheiroTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
`,
  },
  {
    name: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'groovy',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    id("com.google.devtools.ksp") version "1.9.22-1.0.17"
}

android {
    namespace = "com.meudinheiro.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.meudinheiro.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Room Database (Persistência Offline Local)
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")
}
`,
  },
];

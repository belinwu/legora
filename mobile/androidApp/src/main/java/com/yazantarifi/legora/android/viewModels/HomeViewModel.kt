package com.yazantarifi.legora.android.viewModels

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.yazantarifi.legora.champions.ChampionItem
import com.yazantarifi.legora.champions.LegoraChampionsItemsProvider
import com.yazantarifi.legora.home.items.HomeScreenItem
import com.yazantarifi.legora.home.HomeScreenItemsProvider
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val homeWidgetsProvider: HomeScreenItemsProvider,
    private val championsListProvider: LegoraChampionsItemsProvider
): ViewModel() {

    val isLoading by lazy { mutableStateOf(false) }
    val homeScreenWidgetsState by lazy { mutableStateListOf<HomeScreenItem>() }
    val championsItemsState by lazy { mutableStateListOf<ChampionItem>() }

    fun getHomeScreenItems() {
        isLoading.value = true
        viewModelScope.launch(Dispatchers.IO) {
            homeWidgetsProvider.getHomeScreenItems(System.currentTimeMillis()) {
                viewModelScope.launch(Dispatchers.Main) {
                    homeScreenWidgetsState.clear()
                    isLoading.value = false
                    homeScreenWidgetsState.addAll(it)
                }
            }
        }
    }

    fun getChampionsItems() {
        if (championsItemsState.isNotEmpty()) {
            return
        }

        isLoading.value = true
        championsListProvider.getScreenItems {
            viewModelScope.launch(Dispatchers.Main) {
                isLoading.value = false
                championsItemsState.addAll(it)
            }
        }
    }

}

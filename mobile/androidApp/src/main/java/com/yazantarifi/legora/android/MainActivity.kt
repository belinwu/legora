package com.yazantarifi.legora.android

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import com.bumptech.glide.integration.compose.GlideImage
import com.yazantarifi.legora.android.screens.HomeScreen
import com.yazantarifi.legora.android.screens.AuthScreen
import com.yazantarifi.legora.context.LegoraStorageProvider
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var storage: LegoraStorageProvider

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFeb0029))
                    .padding(10.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                GlideImage(
                    model = R.drawable.splash_screen,
                    contentDescription = "Splash Image",
                    modifier = Modifier.fillMaxWidth().padding(20.dp),
                    contentScale = ContentScale.Inside
                )
            }
        }

        Handler(Looper.getMainLooper()).postDelayed({
            onExecuteScreenNavigation()
        }, 4000)
    }

    private fun onExecuteScreenNavigation() {
        when (storage.isUserLoggedIn()) {
            true -> startActivity(Intent(this, HomeScreen::class.java))
            false -> startActivity(Intent(this, AuthScreen::class.java))
        }
        finish()
    }

}

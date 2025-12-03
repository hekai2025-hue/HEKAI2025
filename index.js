cat > index.js << 'EOF'
#!/usr/bin/env node

// 入口文件 - 确保安全加载
try {
  require('./src/app');
} catch (error) {
  console.error('❌ Application failed to start:');
  console.error(error.message);
  process.exit(1);
}
EOF
